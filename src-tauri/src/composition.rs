//! In-app composition: wires portablenote-core and portablenote-infra for vault
//! open/init and use-case execution. No separate compose crate.

use std::io;
use std::path::Path;

use uuid::Uuid;

use portablenote_core::application::commit;
use portablenote_core::application::journal::{self, Journal};
use portablenote_core::application::ports::{BlockStore, ManifestStore, MutationGate, VaultPorts};
use portablenote_core::application::results::VaultWrite;
use portablenote_core::application::runner::UseCases;
use portablenote_core::domain::checksum;
use portablenote_core::domain::error::DomainError;
use portablenote_core::domain::types::Block;
use portablenote_infra::fs::{
    FsBlockStore, FsDocumentStore, FsGraphStore, FsJournalStore, FsManifestStore, FsMutationGate,
    FsNameIndex,
};
use portablenote_infra::SystemClock;

/// Vault session: owns FS adapters and exposes the use-case surface for Tauri commands.
pub struct VaultSession {
    blocks: FsBlockStore,
    graph: FsGraphStore,
    documents: FsDocumentStore,
    names: FsNameIndex,
    manifest: FsManifestStore,
    journal: FsJournalStore,
    clock: SystemClock,
}

impl VaultSession {
    /// Initialize a new empty vault at the given path.
    pub fn init(vault_path: &Path) -> io::Result<()> {
        let pn = vault_path.join("portablenote");
        std::fs::create_dir_all(pn.join("blocks"))?;
        std::fs::create_dir_all(pn.join("documents"))?;

        let manifest = serde_json::json!({
            "vault_id": Uuid::new_v4().to_string(),
            "spec_version": "0.1.0",
            "format": "markdown",
            "checksum": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "previous_checksum": null
        });
        std::fs::write(
            pn.join("manifest.json"),
            serde_json::to_string_pretty(&manifest).unwrap(),
        )?;

        std::fs::write(
            pn.join("block-graph.json"),
            serde_json::to_string_pretty(&serde_json::json!({
                "version": "0.1.0",
                "edges": []
            }))
            .unwrap(),
        )?;

        std::fs::write(pn.join("names.json"), "{}")?;

        Ok(())
    }

    /// Open an existing vault at the given path.
    pub fn open(vault_path: &Path) -> io::Result<Self> {
        let pn = vault_path.join("portablenote");
        if !pn.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("no portablenote directory at {}", vault_path.display()),
            ));
        }

        let mut session = Self {
            blocks: FsBlockStore::open(pn.join("blocks"))?,
            graph: FsGraphStore::open(pn.join("block-graph.json"))?,
            documents: FsDocumentStore::open(pn.join("documents"))?,
            names: FsNameIndex::open(pn.join("names.json"))?,
            manifest: FsManifestStore::open(pn.join("manifest.json")),
            journal: FsJournalStore::open(&pn),
            clock: SystemClock,
        };
        if session.journal.exists() {
            session.run_recovery()?;
        }
        Ok(session)
    }

    fn apply_writes(&mut self, writes: Vec<VaultWrite>) {
        self.apply_writes_only(&writes);
        self.commit_manifest();
    }

    fn apply_writes_only(&mut self, writes: &[VaultWrite]) {
        for write in writes {
            match write {
                VaultWrite::WriteBlock(block) => self.blocks.save(block),
                VaultWrite::DeleteBlock(id) => self.blocks.delete(*id),
                VaultWrite::WriteEdge(edge) => self.graph.save_edge(edge),
                VaultWrite::RemoveEdge(id) => self.graph.remove_edge(*id),
                VaultWrite::WriteDocument(doc) => self.documents.save(doc),
                VaultWrite::DeleteDocument(id) => self.documents.delete(*id),
                VaultWrite::SetName { name, id } => self.names.set(name, *id),
                VaultWrite::RemoveName(name) => self.names.remove(name),
            }
        }
    }

    fn run_recovery(&mut self) -> io::Result<()> {
        let journal: Journal = self
            .journal
            .read()?
            .ok_or_else(|| {
                io::Error::new(io::ErrorKind::InvalidData, "journal exists but could not be read")
            })?;
        let gate = FsMutationGate {
            blocks: &self.blocks,
            graph: &self.graph,
            documents: &self.documents,
            names: &self.names,
            manifest: &self.manifest,
        };
        let vault = gate
            .build_vault()
            .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "no manifest for recovery"))?;
        let actual = checksum::compute(&vault);
        let manifest_checksum = vault.manifest.checksum.clone();
        match journal::recovery_case(&actual, &journal, &manifest_checksum) {
            journal::RecoveryCase::A => {
                let mut m = vault.manifest;
                m.previous_checksum = Some(m.checksum.clone());
                m.checksum = journal.expected_checksum.clone();
                self.manifest.write(&m);
                self.journal.delete()?;
            }
            journal::RecoveryCase::B => {
                self.journal.delete()?;
            }
            journal::RecoveryCase::C => {
                let undo = journal::undo_writes_from_journal(&journal);
                if undo.skipped > 0 {
                    return Err(io::Error::new(
                        io::ErrorKind::InvalidData,
                        format!(
                            "journal before_image/writes mismatch: {} undo step(s) skipped (corrupt journal)",
                            undo.skipped
                        ),
                    ));
                }
                self.apply_writes_only(&undo.writes);
                let gate = FsMutationGate {
                    blocks: &self.blocks,
                    graph: &self.graph,
                    documents: &self.documents,
                    names: &self.names,
                    manifest: &self.manifest,
                };
                let vault_after = gate.build_vault().ok_or_else(|| {
                    io::Error::new(
                        io::ErrorKind::InvalidData,
                        "no manifest after Case C undo",
                    )
                })?;
                let actual_after = checksum::compute(&vault_after);
                if actual_after != manifest_checksum {
                    return Err(io::Error::new(
                        io::ErrorKind::InvalidData,
                        format!(
                            "Case C undo did not restore vault: checksum after undo {actual_after:?} != manifest {manifest_checksum:?}"
                        ),
                    ));
                }
                self.commit_manifest();
                self.journal.delete()?;
            }
        }
        Ok(())
    }

    fn commit_manifest(&self) {
        let gate = FsMutationGate {
            blocks: &self.blocks,
            graph: &self.graph,
            documents: &self.documents,
            names: &self.names,
            manifest: &self.manifest,
        };
        if let Some(vault) = gate.build_vault() {
            commit::write_manifest_after_writes(&vault, &self.manifest);
        }
    }

    fn ports(&self) -> VaultPorts<'_> {
        VaultPorts {
            blocks: &self.blocks,
            graph: &self.graph,
            documents: &self.documents,
            names: &self.names,
            manifest: &self.manifest,
            clock: &self.clock,
        }
    }

    fn use_cases(&self) -> UseCases<'_> {
        UseCases::new(self.ports())
    }

    fn require_gate(&self) -> Result<(), DomainError> {
        let gate = FsMutationGate {
            blocks: &self.blocks,
            graph: &self.graph,
            documents: &self.documents,
            names: &self.names,
            manifest: &self.manifest,
        };
        gate.allow_mutation(None)
    }

    fn commit_with_journal(&mut self, writes: Vec<VaultWrite>) -> io::Result<()> {
        let gate = FsMutationGate {
            blocks: &self.blocks,
            graph: &self.graph,
            documents: &self.documents,
            names: &self.names,
            manifest: &self.manifest,
        };
        let vault = gate
            .build_vault()
            .expect("gate allowed mutation so vault exists");
        let j = journal::build_journal(&vault, &writes);
        self.journal.write(&j)?;
        self.apply_writes(writes);
        self.journal.delete()
    }

    /// Add a block.
    pub fn add_block(&mut self, name: &str, content: &str) -> Result<(), DomainError> {
        self.require_gate()?;
        let id = Uuid::new_v4();
        let result = self.use_cases().add_block(id, name, content)?;
        self.commit_with_journal(result.writes)
            .map_err(|e| DomainError::Io(e.to_string()))?;
        Ok(())
    }

    /// Rename a block.
    pub fn rename_block(&mut self, block_id: Uuid, new_name: &str) -> Result<(), DomainError> {
        self.require_gate()?;
        let result = self.use_cases().rename_block(block_id, new_name)?;
        self.commit_with_journal(result.writes)
            .map_err(|e| DomainError::Io(e.to_string()))?;
        Ok(())
    }

    /// Update a block's content.
    pub fn mutate_content(&mut self, block_id: Uuid, content: &str) -> Result<(), DomainError> {
        self.require_gate()?;
        let result = self.use_cases().mutate_block_content(block_id, content)?;
        self.commit_with_journal(result.writes)
            .map_err(|e| DomainError::Io(e.to_string()))?;
        Ok(())
    }

    /// Delete a block (safe or cascade).
    pub fn delete_block(&mut self, block_id: Uuid, cascade: bool) -> Result<(), DomainError> {
        self.require_gate()?;
        let writes = if cascade {
            self.use_cases().delete_block_cascade(block_id)?.writes
        } else {
            self.use_cases().delete_block_safe(block_id)?.writes
        };
        self.commit_with_journal(writes)
            .map_err(|e| DomainError::Io(e.to_string()))?;
        Ok(())
    }

    /// Add a reference edge between two blocks.
    pub fn add_edge(&mut self, source: Uuid, target: Uuid) -> Result<(), DomainError> {
        self.require_gate()?;
        let id = Uuid::new_v4();
        let result = self.use_cases().add_edge(id, source, target)?;
        self.commit_with_journal(result.writes)
            .map_err(|e| DomainError::Io(e.to_string()))?;
        Ok(())
    }

    /// Remove a reference edge.
    pub fn remove_edge(&mut self, edge_id: Uuid) -> Result<(), DomainError> {
        self.require_gate()?;
        let result = self.use_cases().remove_edge(edge_id)?;
        self.commit_with_journal(result.writes)
            .map_err(|e| DomainError::Io(e.to_string()))?;
        Ok(())
    }

    /// List all blocks, sorted by name.
    pub fn list_blocks(&self) -> Vec<Block> {
        let mut blocks = self.blocks.list();
        blocks.sort_by(|a, b| a.name.cmp(&b.name));
        blocks
    }
}
