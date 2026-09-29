const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const db = require("./db.cjs");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(
  "/uploads",
  express.static(uploadDir)
);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const safeName =
      path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_");

    const filename =
      `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}_${safeName}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 1024 * 1024 * 500,
  },
});

/* =========================================================
   GET ALL TASKS
========================================================= */

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );

    const tasks = result.rows.map((task) => ({
      ...task,
      subtasks: Array.isArray(task.subtasks)
        ? task.subtasks
        : [],
    }));

    res.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    res.status(500).json({ error: "Gagal mengambil tasks" });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM transactions
       ORDER BY transaction_at DESC, created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);
    res.status(500).json({
      error: "Gagal mengambil transactions",
    });
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

    const result = await db.query(
      `INSERT INTO transactions
       (
         id,
         user_id,
         type,
         amount,
         category,
         source_or_note,
         transaction_at,
         created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        id,
        user_id,
        type,
        amount,
        category || "Umum",
        source_or_note || "",
        transaction_at,
        created_at || new Date(),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST TRANSACTION ERROR:", error);
    res.status(500).json({
      error: "Gagal menyimpan transaction",
    });
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

    const result = await db.query(
      `UPDATE transactions
       SET
         type = $1,
         amount = $2,
         category = $3,
         source_or_note = $4,
         transaction_at = $5
       WHERE id = $6
       RETURNING *`,
      [
        type,
        amount,
        category || "Umum",
        source_or_note || "",
        transaction_at,
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
    console.error("UPDATE TRANSACTION ERROR:", error);
    res.status(500).json({
      error: "Gagal mengupdate transaction",
    });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM transactions
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction tidak ditemukan",
      });
    }

    res.json({
      success: true,
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE TRANSACTION ERROR:", error);
    res.status(500).json({
      error: "Gagal menghapus transaction",
    });
  }
});

/* =========================================================
   CREATE TASK
========================================================= */

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
      completed_at,
      subtasks,
    } = req.body;
    
    

    const result = await db.query(
      `INSERT INTO tasks
      (
        id,
        user_id,
        title,
        description,
        category,
        priority,
        status,
        due_at,
        completed_at,
        subtasks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        id,
        user_id,
        title,
        description || "",
        category || "Umum",
        priority || "medium",
        status || "todo",
        due_at || null,
        completed_at || null,
        JSON.stringify(Array.isArray(subtasks) ? subtasks : []),
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
      `UPDATE tasks
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
       RETURNING *`,
      [
        title,
        description || "",
        category || "Umum",
        priority || "medium",
        status || "todo",
        due_at || null,
        completed_at || null,
        JSON.stringify(Array.isArray(subtasks) ? subtasks : []),
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
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({
      error: "Gagal mengupdate task",
    });
  }
});
/* =========================================================
   DELETE TASK
========================================================= */

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task tidak ditemukan",
      });
    }

    res.json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    res.status(500).json({
      error: "Gagal menghapus task",
    });
  }
});

/* =========================================================
   TOGGLE TASK STATUS
========================================================= */

app.patch("/api/tasks/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const current = await db.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({
        error: "Task tidak ditemukan",
      });
    }

    const task = current.rows[0];

    let newStatus;
    let completedAt;

    if (task.status === "completed") {
      newStatus = "in_progress";
      completedAt = null;
    } else {
      newStatus = "completed";
      completedAt = new Date();
    }

    const newSubtasks =
      newStatus === "completed"
        ? (Array.isArray(task.subtasks)
            ? task.subtasks
            : []
          ).map((subtask) => ({
            ...subtask,
            completed: true,
          }))
        : task.subtasks;

    const result = await db.query(
      `UPDATE tasks
       SET
         status = $1,
         completed_at = $2,
         subtasks = $3
       WHERE id = $4
       RETURNING *`,
      [
        newStatus,
        completedAt,
        JSON.stringify(newSubtasks || []),
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("TOGGLE TASK ERROR:", error);

    res.status(500).json({
      error: "Gagal mengubah status task",
    });
  }
});

/* =========================================================
   TOGGLE SUBTASK
========================================================= */

app.patch(
  "/api/tasks/:taskId/subtasks/:subtaskId/toggle",
  async (req, res) => {
    try {
      const { taskId, subtaskId } = req.params;

      const result = await db.query(
        "SELECT * FROM tasks WHERE id = $1",
        [taskId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Task tidak ditemukan",
        });
      }

      const task = result.rows[0];

      const subtasks = Array.isArray(task.subtasks)
        ? task.subtasks
        : [];

      const index = subtasks.findIndex(
        (subtask) => subtask.id === subtaskId
      );

      if (index === -1) {
        return res.status(404).json({
          error: "Subtask tidak ditemukan",
        });
      }

      subtasks[index].completed =
        !subtasks[index].completed;

      const updated = await db.query(
        `UPDATE tasks
         SET subtasks = $1
         WHERE id = $2
         RETURNING *`,
        [
          JSON.stringify(subtasks),
          taskId,
        ]
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

/* =========================================================
   FILES
========================================================= */

app.get("/api/files", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM files
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET FILES ERROR:", error);

    res.status(500).json({
      error: "Gagal mengambil files",
    });
  }
});

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
        `/uploads/${req.file.filename}`,
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

    if (req.file) {
      const uploadedPath = path.join(
        uploadDir,
        req.file.filename
      );

      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    }

    res.status(500).json({
      error: "Gagal mengupload file",
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


app.listen(PORT, "0.0.0.0", () => {
  console.log(`API berjalan di port ${PORT}`);
});