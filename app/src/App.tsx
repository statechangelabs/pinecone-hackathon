import { useState, Fragment } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ConvexReactClient, useAction } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { api } from "../convex/_generated/api";
import Logo from "./Logo";
import RepoList from "./Repos";
import { ToastContainer } from "react-toastify";
import Repo from "./Repo";

const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const clerkPubKey = import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;
function App() {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={clerkPubKey}>
        <SignedIn>
          <ConvexProviderWithClerk client={client}>
            <div className="flex flex-row justify-between w-full">
              <Link to="/" className="flex flex-row">
                <Logo className="w-10 h-10" />
                <h1 className="text-2xl font-bold text-gray-100 ml-2">
                  No-Code AI Helper
                </h1>
              </Link>
              <div className="pt-2">
                <UserButton />
              </div>
            </div>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/" element={<RepoList />} />
              <Route path="/repo/:id" element={<Repo />} />
            </Routes>
          </ConvexProviderWithClerk>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </ClerkProvider>
      <ToastContainer />
    </BrowserRouter>
  );
}

const Welcome = () => {
  const [count, setCount] = useState(0);
  const testAction = useAction(api.actions.myAction);
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
