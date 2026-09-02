import { completeProfile } from "@/app/actions/user";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.rollNo) redirect("/");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Background orbs — same palette as login */}
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "rgba(249, 115, 22, 0.15)",
          top: "-150px",
          right: "-150px",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          background: "rgba(234, 179, 8, 0.15)",
          bottom: "-100px",
          left: "-100px",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 300,
          height: 300,
          background: "rgba(239, 68, 68, 0.1)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Card */}
      <div
        className="glass auth-card"
      >
        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "24px",
            background: "linear-gradient(135deg, #f97316, #ef4444)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            margin: "0 auto 28px",
            boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
          }}
        >
          📋
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            marginBottom: "8px",
            letterSpacing: "-0.5px",
            color: "#431407",
            textAlign: "center",
          }}
        >
          <span className="gradient-text">COMPLETE</span>
          <br />
          YOUR PROFILE
        </h1>

        <p
          style={{
            color: "#78350f",
            fontSize: "14px",
            marginBottom: "36px",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Hey! We need a few more details before you can start complaining 🍽️
        </p>

        {/* Form */}
        <form action={completeProfile} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              defaultValue={session.user.name ?? ""}
              className="input"
            />
          </div>

          {/* Roll Number */}
          <div>
            <label htmlFor="rollNo" className="label">
              Roll Number
            </label>
            <input
              id="rollNo"
              name="rollNo"
              type="text"
              required
              placeholder="e.g. 21BCE1234"
              className="input"
            />
          </div>

          {/* Hostel */}
          <div>
            <label htmlFor="hostel" className="label">
              Hostel
            </label>
            <select id="hostel" name="hostel" required className="input" defaultValue="">
              <option value="" disabled>Select your hostel</option>
              <option value="Aryabhatta">Aryabhatta</option>
              <option value="S.Ramanujan">S.Ramanujan</option>
              <option value="M.S.Swaminathan">M.S.Swaminathan</option>
              <option value="V.G.Bhide">V.G.Bhide</option>
              <option value="A.P.J. Abdul Kalam">A.P.J. Abdul Kalam</option>
              <option value="C.V.Raman">C.V.Raman</option>
              <option value="Homi.J.Bhabha">Homi.J.Bhabha</option>
              <option value="J.C.Bose">J.C.Bose</option>
              <option value="Meghnad Saha">Meghnad Saha</option>
              <option value="Vikram Sarabhai">Vikram Sarabhai</option>
            </select>
          </div>

          {/* Mess */}
          <div>
            <label htmlFor="mess" className="label">
              Mess
            </label>
            <select id="mess" name="mess" required className="input" defaultValue="">
              <option value="" disabled>Select your mess</option>
              <option value="Swadanand Mess">Swadanand Mess</option>
              <option value="Aaswad Mess">Aaswad Mess</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "16px 24px", fontSize: "16px", marginTop: "8px" }}
            id="complete-profile-btn"
          >
            ✅ Complete Profile
          </button>
        </form>

        <p style={{ marginTop: "24px", color: "#9a3412", fontSize: "13px", opacity: 0.8, textAlign: "center" }}>
          Logged in as <strong>{session.user.email}</strong>
        </p>
      </div>
    </main>
  );
}
