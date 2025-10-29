import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.get(/^(?!\/api).*$/, async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientPath = path.resolve(process.cwd(), "client");
      let template = fs.readFileSync(
        path.resolve(clientPath, "index.html"),
        "utf-8"
      );

      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  app.get(/^(?!\/api).*$/, (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
