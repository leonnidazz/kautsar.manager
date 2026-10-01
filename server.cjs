const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const db = require("./db.cjs");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
// =========================
// TASKS - POSTGRESQL
// =========================

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM tasks
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    res.status(500).json({
      error: "Gagal mengambil tasks",
    });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const {
      id,
      user_id,
      title,
      description,
      category,
      priority,
      status,
      due_at,
      created_at,
      completed_at,
      subtasks,
    } = req.body;

    const normalizedSubtasks =
      typeof subtasks === "string"
        ? JSON.parse(subtasks)
        : subtasks || [];

    const result = await db.query(
      `
      INSERT INTO tasks (
        id,
        user_id,
        title,
        description,
        category,
        priority,
        status,
        due_at,
        created_at,
        completed_at,
        subtasks
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )
      RETURNING *
      `,
      [
        id,
        user_id,
        title,
        description || "",
        category,
        priority,
        status,
        due_at || null,
        created_at || new Date(),
        completed_at || null,
        JSON.stringify(normalizedSubtasks),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST TASK ERROR:", error);

    res.status(500).json({
      error: "Gagal menyimpan task",
    });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      priority,
      status,
      due_at,
      completed_at,
      subtasks,
    } = req.body;

    const result = await db.query(
      `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        category = $3,
        priority = $4,
        status = $5,
        due_at = $6,
        completed_at = $7,
        subtasks = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        title,
        description || "",
        category,
        priority,
        status,
        due_at || null,
        completed_at || null,
        JSON.stringify(
          typeof subtasks === "string"
            ? JSON.parse(subtasks)
            : subtasks || []
        ),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PATCH TASK ERROR:", error);

    res.status(500).json({
      error: "Gagal mengubah task",
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task tidak ditemukan",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    res.status(500).json({
      error: "Gagal menghapus task",
    });
  }
});

app.patch("/api/tasks/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      UPDATE tasks
      SET
        status = CASE
          WHEN status = 'completed'
            THEN 'pending'
          ELSE 'completed'
        END,
        completed_at = CASE
          WHEN status = 'completed'
            THEN NULL
          ELSE NOW()
        END
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("TOGGLE TASK ERROR:", error);

    res.status(500).json({
      error: "Gagal mengubah status task",
    });
  }
});

app.patch(
  "/api/tasks/:taskId/subtasks/:subtaskId/toggle",
  async (req, res) => {
    try {
      const { taskId, subtaskId } = req.params;

      const result = await db.query(
        `
        SELECT subtasks
        FROM tasks
        WHERE id = $1
        LIMIT 1
        `,
        [taskId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Task tidak ditemukan",
        });
      }

      const subtasks = Array.isArray(result.rows[0].subtasks)
        ? result.rows[0].subtasks
        : [];

      const index = subtasks.findIndex(
        (subtask) => String(subtask.id) === String(subtaskId)
      );

      if (index === -1) {
        return res.status(404).json({
          error: "Subtask tidak ditemukan",
        });
      }

      subtasks[index] = {
        ...subtasks[index],
        completed: !Boolean(subtasks[index].completed),
      };

      const updated = await db.query(
        `
        UPDATE tasks
        SET subtasks = $1
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(subtasks), taskId]
      );

      res.json(updated.rows[0]);
    } catch (error) {
      console.error("TOGGLE SUBTASK ERROR:", error);

      res.status(500).json({
        error: "Gagal mengubah subtask",
      });
    }
  }
);
app.use(cors());

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,

  limits: {
    fileSize: 1024 * 1024 * 500,
  },
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET =
  process.env.SUPABASE_BUCKET || "files";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function uploadToSupabaseStorage(file) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi."
    );
  }

  if (!SUPABASE_BUCKET) {
    throw new Error(
      "SUPABASE_BUCKET belum dikonfigurasi."
    );
  }

  const ext = path.extname(file.originalname);

  const safeName = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  const filename =
    `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}_${safeName}${ext}`;

  const storagePath = `uploads/${filename}`;

  const encodedPath = storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const storageUrl =
    `${SUPABASE_URL}/storage/v1/object/` +
    `${encodeURIComponent(SUPABASE_BUCKET)}/${encodedPath}`;

  console.log("SUPABASE STORAGE UPLOAD START:", {
    bucket: SUPABASE_BUCKET,
    path: storagePath,
    size: file.size,
    mimeType: file.mimetype,
  });

  const response = await fetch(storageUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type":
        file.mimetype || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file.buffer,
  });

  const responseText = await response.text();

  console.log(
    "SUPABASE STORAGE RESPONSE:",
    response.status,
    responseText || "(empty response)"
  );

  if (!response.ok) {
    throw new Error(
      `Supabase Storage upload gagal (${response.status}): ${
        responseText || "response kosong"
      }`
    );
  }

  console.log(
    "SUPABASE STORAGE UPLOAD SUCCESS:",
    storagePath
  );

  return storagePath;
}

app.post("/api/files/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "File tidak ditemukan",
      });
    }

    const {
      id,
      user_id,
      folder,
      tags,
      description,
    } = req.body;

    // Upload binary file ke Supabase Storage
    const storagePath = await uploadToSupabaseStorage(req.file);

    const result = await db.query(
      `INSERT INTO files
       (
         id,
         user_id,
         name,
         storage_path,
         mime_type,
         size,
         folder,
         tags,
         description,
         created_at
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        id,
        user_id,
        req.file.originalname,
        storagePath,
        req.file.mimetype || "application/octet-stream",
        req.file.size,
        folder || "Umum",
        JSON.stringify(
          tags
            ? JSON.parse(tags)
            : []
        ),
        description || "",
        new Date(),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("UPLOAD FILE ERROR:", error);

    res.status(500).json({
      error: error.message || "Gagal mengupload file",
    });
  }
});

app.post("/api/files", async (req, res) => {
  try {
    const {
      id,
      user_id,
      name,
      storage_path,
      mime_type,
      size,
      folder,
      tags,
      description,
      created_at,
    } = req.body;

    const result = await db.query(
      `INSERT INTO files
       (
         id,
         user_id,
         name,
         storage_path,
         mime_type,
         size,
         folder,
         tags,
         description,
         created_at
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        id,
        user_id,
        name,
        storage_path,
        mime_type,
        size || 0,
        folder || "Umum",
        JSON.stringify(
          Array.isArray(tags) ? tags : []
        ),
        description || "",
        created_at || new Date(),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST FILE ERROR:", error);

    res.status(500).json({
      error: "Gagal menyimpan file",
    });
  }
});

app.patch("/api/files/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      storage_path,
      mime_type,
      size,
      folder,
      tags,
      description,
    } = req.body;

    const result = await db.query(
      `UPDATE files
       SET
         name = $1,
         storage_path = $2,
         mime_type = $3,
         size = $4,
         folder = $5,
         tags = $6,
         description = $7
       WHERE id = $8
       RETURNING *`,
      [
        name,
        storage_path,
        mime_type,
        size || 0,
        folder || "Umum",
        JSON.stringify(
          Array.isArray(tags) ? tags : []
        ),
        description || "",
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "File tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE FILE ERROR:", error);

    res.status(500).json({
      error: "Gagal mengupdate file",
    });
  }
});

app.delete("/api/files/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM files
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "File tidak ditemukan",
      });
    }

    res.json({
      success: true,
      file: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);

    res.status(500).json({
      error: "Gagal menghapus file",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */
// DOWNLOAD FILE DARI SUPABASE STORAGE
app.get("/api/files/download/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT *
       FROM files
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "File tidak ditemukan di database",
      });
    }

    const file = result.rows[0];

    if (!file.storage_path) {
      return res.status(404).json({
        error: "Storage path file tidak ditemukan",
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: "Konfigurasi Supabase Storage belum tersedia",
      });
    }

    const encodedPath = file.storage_path
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const storageUrl =
      `${SUPABASE_URL}/storage/v1/object/` +
      `${SUPABASE_BUCKET}/${encodedPath}`;

    const response = await fetch(storageUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "SUPABASE DOWNLOAD ERROR:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error: "Gagal mengambil file dari Supabase Storage",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader(
      "Content-Type",
      file.mime_type || "application/octet-stream"
    );

    res.setHeader(
      "Content-Length",
      buffer.length
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.name)}"`
    );

    res.send(buffer);
  } catch (error) {
    console.error("DOWNLOAD FILE ERROR:", error);

    res.status(500).json({
      error: error.message || "Gagal mendownload file",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API berjalan di port ${PORT}`);
});