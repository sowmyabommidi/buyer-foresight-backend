import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;
const FILE = "./users.json";


// Read users
const readUsers = () => {
  try {
    const data = fs.readFileSync(FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
};


// Write users
const writeUsers = (data) => {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};


// GET all users
app.get("/users", (req, res) => {
  let users = readUsers();

  const { search, sort, order } = req.query;

  if (search) {
    users = users.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (sort) {
    users.sort((a, b) => {
      if (order === "desc") {
        return b[sort].localeCompare(a[sort]);
      }
      return a[sort].localeCompare(b[sort]);
    });
  }

  res.json(users);
});


// GET user by ID
app.get("/users/:id", (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});


// POST create user
app.post("/users", (req, res) => {
  const users = readUsers();

  const newUser = {
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});


// PUT update user
app.put("/users/:id", (req, res) => {
  let users = readUsers();

  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  writeUsers(users);

  res.json(user);
});
// DELETE user
app.delete("/users/:id", (req, res) => {
  let users = readUsers();
  const filteredUsers = users.filter(u => u.id !== req.params.id);
  writeUsers(filteredUsers);
  res.json({ message: "User deleted" });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});