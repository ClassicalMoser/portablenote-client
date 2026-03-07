import { createSignal } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";
import { initVault } from "./lib";
import "./App.css";

function App() {
  const [status, setStatus] = createSignal<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = createSignal("");

  async function handleInitVault() {
    const path = await open({
      directory: true,
      multiple: false,
    });
    if (path == null) return;
    setStatus("loading");
    setMessage("");
    try {
      await initVault(path);
      setStatus("success");
      setMessage(`Vault initialized at ${path}`);
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
          <p class={status() === "error" ? "status error" : "status success"}>{message()}</p>
        )}
      </div>
    </>
  );
}

export default App;
