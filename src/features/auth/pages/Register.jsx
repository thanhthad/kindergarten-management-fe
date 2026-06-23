import { useState } from "react";
import { authApi } from "../../../api/authApi";

function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await register(form);
      console.log("Register success:", res.data);
      alert("Đăng ký thành công!");
    } catch (err) {
      console.error("Register error:", err);
      alert("Đăng ký thất bại!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded w-[300px] space-y-3"
      >
        <input
          name="fullName"
          placeholder="Full name"
          onChange={handleChange}
          className="border w-full p-2"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border w-full p-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border w-full p-2"
        />

        <button className="bg-blue-500 text-white w-full p-2">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;