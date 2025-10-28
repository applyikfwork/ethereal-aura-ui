import express, { type Express } from "express";
import fs from "fs/promises";
import path from "path";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientPath = path.resolve(process.cwd(), "client");
      let template = await fs.readFile(
        path.resolve(clientPath, "index.html"),
        "utf-8"
      );

      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return app;
}

export function serveStatic(app: Express) {
  const clientPath = path.resolve(process.cwd(), "dist");

  app.use(express.static(clientPath));

  app.use((_req, res) => {
    res.sendFile(path.resolve(clientPath, "index.html"));
  });
}
