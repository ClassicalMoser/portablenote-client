import {
  addBlock,
  initVaultWithPicker,
  listBlocks,
  openVaultWithPicker,
} from "@application";
import { createSignal } from "solid-js";
import "./App.css";

function App() {
  const [status, setStatus] = createSignal<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = createSignal("");
  const [blockName, setBlockName] = createSignal("");

  async function handleInitVault() {
    setStatus("loading");
    setMessage("");
    try {
      const path = await initVaultWithPicker();
      if (path == null) {
        setStatus("idle");
        return;
      }
      setStatus("success");
      setMessage(`Vault initialized at ${path}`);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleOpenVault() {
    setStatus("loading");
    setMessage("");
    try {
      const path = await openVaultWithPicker();
      if (path == null) {
        setStatus("idle");
        return;
      }
      setStatus("success");
      setMessage(`Vault opened at ${path}`);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleAddBlock() {
    const name = blockName().trim();
    if (name.length === 0) return;
    setStatus("loading");
    setMessage("");
    try {
      await addBlock(name, "");
      setStatus("success");
      setMessage(`Block added: ${name}`);
      setBlockName("");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleListBlocks() {
    setStatus("loading");
    setMessage("");
    try {
      const blocks = await listBlocks();
      setStatus("success");
      setMessage(`Found ${blocks.length} blocks`);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <h1>Portable Note</h1>
      <div class="card">
        <button onClick={handleInitVault} disabled={status() === "loading"}>
          {status() === "loading" ? "Initializing…" : "Init vault…"}
        </button>
        {message() && (
          <p class={status() === "error" ? "status error" : "status success"}>
            {message()}
          </p>
        )}
        <button onClick={handleOpenVault} disabled={status() === "loading"}>
          Open vault
        </button>
        <button onClick={handleListBlocks} disabled={status() === "loading"}>
          List blocks
        </button>
        <div class="card create-block">
          <input
            type="text"
            placeholder="Block name"
            value={blockName()}
            onInput={(e) => setBlockName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBlock()}
          />
          <button onClick={handleAddBlock} disabled={status() === "loading"}>
            Create block
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
