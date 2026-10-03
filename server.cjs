const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");


const db = require("./db.cjs");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://kautsar-manager-1.onrender.com",
    ],
  })
);

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


// =========================
// TRANSACTIONS - POSTGRESQL
// =========================

app.get("/api/transactions", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM transactions
      ORDER BY transaction_at DESC, created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);
    res.status(500).json({ error: "Gagal mengambil transactions" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const {
      id,
      user_id,
      type,
      amount,
      category,
      source_or_note,
      transaction_at,
      created_at,
    } = req.body;

    if (!id || !user_id || !type || amount === undefined || !category) {
      return res.status(400).json({ error: "Data transaksi tidak lengkap" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: "Type transaksi harus income atau expense",
      });
    }

    const result = await db.query(
      `
      INSERT INTO transactions (
        id, user_id, type, amount, category,
        source_or_note, transaction_at, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        id,
        user_id,
        type,
        Number(amount),
        category,
        source_or_note || "",
        transaction_at || new Date().toISOString().split("T")[0],
        created_at || new Date(),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST TRANSACTION ERROR:", error);
    res.status(500).json({ error: "Gagal menyimpan transaction" });
  }
});

app.patch("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      amount,
      category,
      source_or_note,
      transaction_at,
    } = req.body;

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: "Type transaksi harus income atau expense",
      });
    }

    const result = await db.query(
      `
      UPDATE transactions
      SET
        type = COALESCE($1, type),
        amount = COALESCE($2, amount),
        category = COALESCE($3, category),
        source_or_note = COALESCE($4, source_or_note),
        transaction_at = COALESCE($5, transaction_at)
      WHERE id = $6
      RETURNING *
      `,
      [
        type || null,
        amount === undefined ? null : Number(amount),
        category || null,
        source_or_note === undefined ? null : source_or_note,
        transaction_at || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PATCH TRANSACTION ERROR:", error);
    res.status(500).json({ error: "Gagal mengubah transaction" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM transactions
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction tidak ditemukan",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("DELETE TRANSACTION ERROR:", error);
    res.status(500).json({ error: "Gagal menghapus transaction" });
  }
});

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

function getSupabaseStorageUrl(storagePath, authenticated = false) {
  const encodedPath = String(storagePath || "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  const accessType = authenticated
    ? "authenticated"
    : "public";

  return (
    `${SUPABASE_URL}/storage/v1/object/` +
    `${accessType}/` +
    `${encodeURIComponent(SUPABASE_BUCKET)}/${encodedPath}`
  );
}

async function deleteFromSupabaseStorage(storagePath) {
  if (!storagePath) return;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Konfigurasi Supabase Storage belum tersedia"
    );
  }

  const response = await fetch(
    getSupabaseStorageUrl(storagePath),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(
      `Supabase Storage delete gagal (${response.status}): ${
        errorText || "response kosong"
      }`
    );
  }
}

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

  console.log("SUPABASE STORAGE UPLOAD START:", {
    bucket: SUPABASE_BUCKET,
    path: storagePath,
    size: file.size,
    mimeType: file.mimetype,
  });

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType:
        file.mimetype || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    console.error(
      "SUPABASE STORAGE UPLOAD ERROR:",
      error
    );

    throw new Error(
      `Supabase Storage upload gagal: ${error.message}`
    );
  }

  console.log(
    "SUPABASE STORAGE UPLOAD SUCCESS:",
    data
  );

  return storagePath;
}

app.post(
  "/api/files/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "File tidak ditemukan",
        });
      }

      const {
        user_id,
        folder,
        tags,
        description,
      } = req.body;

      const storagePath =
        await uploadToSupabaseStorage(req.file);

      const id =
        `fl_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 6)}`;

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
          user_id || "usr_01h8q7k9",
          req.file.originalname,
          storagePath,
          req.file.mimetype ||
            "application/octet-stream",
          req.file.size || 0,
          folder || "Umum",
          JSON.stringify(
            tags
              ? Array.isArray(tags)
                ? tags
                : [tags]
              : []
          ),
          description || "",
          new Date(),
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(
        "POST FILE UPLOAD ERROR:",
        error
      );

      res.status(500).json({
        error:
          error.message ||
          "Gagal upload file",
      });
    }
  }
);

app.post(
  "/api/files",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "File tidak ditemukan",
        });
      }

      const {
        user_id,
        folder,
        tags,
        description,
      } = req.body;

      const storagePath =
        await uploadToSupabaseStorage(req.file);

      const id =
        `fl_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 6)}`;

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
          user_id || "usr_01h8q7k9",
          req.file.originalname,
          storagePath,
          req.file.mimetype ||
            "application/octet-stream",
          req.file.size || 0,
          folder || "Umum",
          JSON.stringify(
            tags
              ? Array.isArray(tags)
                ? tags
                : [tags]
              : []
          ),
          description || "",
          new Date(),
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST FILE ERROR:", error);

      res.status(500).json({
        error:
          error.message ||
          "Gagal menyimpan file",
      });
    }
  }
);

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
      `SELECT *
       FROM files
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "File tidak ditemukan",
      });
    }

    const file = result.rows[0];

    if (file.storage_path) {
      await deleteFromSupabaseStorage(file.storage_path);
    }

    await db.query(
      `DELETE FROM files
       WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      file,
    });
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);

    res.status(500).json({
      error: error.message || "Gagal menghapus file",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */
// PREVIEW FILE DARI SUPABASE STORAGE
app.get("/api/files/preview/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM files WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "File tidak ditemukan",
      });
    }

    const file = result.rows[0];

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .download(file.storage_path);

    if (error) {
      console.error("SUPABASE PREVIEW ERROR:", error);

      return res.status(404).json({
        error: "File tidak ditemukan di Storage",
      });
    }

    const buffer = Buffer.from(
      await data.arrayBuffer()
    );

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
      "inline"
    );

    res.send(buffer);
  } catch (error) {
    console.error("PREVIEW FILE ERROR:", error);

    res.status(500).json({
      error: "Gagal membuka preview file",
    });
  }
});

// DOWNLOAD FILE DARI SUPABASE STORAGE
app.get("/api/files/download/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM files WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "File tidak ditemukan",
      });
    }

    const file = result.rows[0];

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .download(file.storage_path);

    if (error) {
      console.error("SUPABASE DOWNLOAD ERROR:", error);

      return res.status(404).json({
        error: "File tidak ditemukan di Storage",
      });
    }

    const buffer = Buffer.from(
      await data.arrayBuffer()
    );

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
      `attachment; filename="${encodeURIComponent(
        file.name
      )}"`
    );

    res.send(buffer);
  } catch (error) {
    console.error("DOWNLOAD FILE ERROR:", error);

    res.status(500).json({
      error: "Gagal mengunduh file",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API berjalan di port ${PORT}`);
});