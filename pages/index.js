// pages/index.js
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      {!session ? (
        <>
          <h1>You are not signed in</h1>
          <button onClick={() => signIn("google")}>Sign in with Google</button>
        </>
      ) : (
        <>
          <h1>Welcome, {session.user.name}</h1>
          <Image
            src={session.user.image}
            alt={session.user.name}
            width={96}         // specify width (adjust as needed)
            height={96}        // specify height (adjust as needed)
            style={{ borderRadius: "50%" }}
          />
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      )}
    </div>
  );
}
