import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type UserRow = {
  id: number;
  name: string;
};

type TaskRow = {
  id: number;
  title: string;
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

async function createUser(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return;
  }

  const supabase = await getSupabase();
  await supabase.from("user").insert({ name });
  revalidatePath("/");
}

async function updateUser(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  if (!Number.isInteger(id) || id <= 0 || !name) {
    return;
  }

  const supabase = await getSupabase();
  await supabase.from("user").update({ name }).eq("id", id);
  revalidatePath("/");
}

async function deleteUser(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const supabase = await getSupabase();
  await supabase.from("user").delete().eq("id", id);
  revalidatePath("/");
}

async function createTask(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) {
    return;
  }

  const supabase = await getSupabase();
  await supabase.from("tasks").insert({ title });
  revalidatePath("/");
}

async function updateTask(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  if (!Number.isInteger(id) || id <= 0 || !title) {
    return;
  }

  const supabase = await getSupabase();
  await supabase.from("tasks").update({ title }).eq("id", id);
  revalidatePath("/");
}

async function deleteTask(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const supabase = await getSupabase();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/");
}

export default async function Page() {
  const supabase = await getSupabase();

  const [{ data: users, error: usersError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase.from("user").select("id, name").order("id", { ascending: false }),
    supabase.from("tasks").select("id, title").order("id", { ascending: false }),
  ]);

  return (
    <main className="page-shell">
      <section className="card">
        <h2>Users</h2>
        {usersError ? <p className="form-msg form-msg-error">{usersError.message}</p> : null}

        <form action={createUser} className="row-actions" style={{ marginTop: "0.8rem" }}>
          <input name="name" placeholder="New user name" required maxLength={120} />
          <button className="primary-button" type="submit">
            Add User
          </button>
        </form>

        <div className="table-wrap" style={{ marginTop: "0.8rem" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users as UserRow[] | null)?.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>
                    <form action={updateUser} className="row-actions">
                      <input type="hidden" name="id" value={String(user.id)} />
                      <input name="name" defaultValue={user.name} maxLength={120} required />
                      <button className="ghost-button" type="submit">
                        Update
                      </button>
                    </form>
                    <form action={deleteUser} className="row-actions">
                      <input type="hidden" name="id" value={String(user.id)} />
                      <button className="danger-button" type="submit">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Tasks</h2>
        {tasksError ? <p className="form-msg form-msg-error">{tasksError.message}</p> : null}

        <form action={createTask} className="row-actions" style={{ marginTop: "0.8rem" }}>
          <input name="title" placeholder="New task title" required maxLength={200} />
          <button className="primary-button" type="submit">
            Add Task
          </button>
        </form>

        <div className="table-wrap" style={{ marginTop: "0.8rem" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tasks as TaskRow[] | null)?.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>
                    <form action={updateTask} className="row-actions">
                      <input type="hidden" name="id" value={String(task.id)} />
                      <input name="title" defaultValue={task.title} maxLength={200} required />
                      <button className="ghost-button" type="submit">
                        Update
                      </button>
                    </form>
                    <form action={deleteTask} className="row-actions">
                      <input type="hidden" name="id" value={String(task.id)} />
                      <button className="danger-button" type="submit">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
