import { useState, Fragment } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Query from "./Query";
import { ConvexReactClient, useAction } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { api } from "../convex/_generated/api";

const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const clerkPubKey = import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;
console.log("clerkPubKey", clerkPubKey);
function App() {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={clerkPubKey}>
        <SignedIn>
          <ConvexProviderWithClerk client={client}>
            <UserButton />

            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/query" element={<Query />} />
            </Routes>
          </ConvexProviderWithClerk>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </ClerkProvider>
    </BrowserRouter>
  );
}

const Welcome = () => {
  const [count, setCount] = useState(0);
  const testAction = useAction(api.testme.myAction);
  const { userId } = useAuth();
  return (
    <Fragment>
      <div>
        <button
          onClick={async () => {
            const result = await testAction({});
            console.log("result", result);
          }}
        >
          Test Action
        </button>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p className="font-bold text-md text-red-800">YOur id is {userId}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </Fragment>
  );
};

export default App;
