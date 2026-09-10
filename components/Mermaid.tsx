"use client";

import { useEffect, useRef, useState } from "react";

export default function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const render = async () => {
      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "dark",
        });

        const id = `m-${Math.random().toString(36).slice(2)}`;

        const { svg } = await mermaid.render(id, code);

        if (active && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        if (active) {
          setError(true);
        }
      }
    };

    render();

    return () => {
      active = false;
    };
  }, [code]);

  if (error) {
    return (
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-wrap"
      aria-label="Mermaid diagram"
    />
  );
}