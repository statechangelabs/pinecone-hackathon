import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { FC } from "react";
import { Formik, Field, Form } from "formik";

export default function RepoList() {
  const repos = useQuery(api.repos.list);
  if (!repos) return <div>Loading...</div>;
  return (
    <div className="flex flex-col bg-gray-100 border-gray-200 box-shadow p-5">
      <ul role="list" className="divide-y divide-gray-100">
        {repos.map((repo) => (
          <li key={repo.url} className="flex justify-between gap-x-6 py-5">
            <div className="flex gap-x-4">
              {/* <img
              className="h-12 w-12 flex-none rounded-full bg-gray-50"
              src={person.imageUrl}
              alt=""
            /> */}
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {repo.url}
                </p>
                {/* <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                {person.email}
              </p> */}
              </div>
            </div>
            <div className="hidden sm:flex sm:flex-col sm:items-end">
              {/* <p className="text-sm leading-6 text-gray-900">{repo.status}</p> */}
              {repo.lastModified ? (
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  <time dateTime={new Date(repo.lastModified).toISOString()}>
                    {new Date(repo.lastModified).toLocaleString()}
                  </time>
                </p>
              ) : (
                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                    {repo.status === "ready" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                    {repo.status !== "ready" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs leading-5 text-gray-500">
                    {repo.status}
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <AddRepo />
    </div>
  );
}

const AddRepo: FC = () => {
  const addRepo = useAction(api.actions.cacheRepoAction);
  return (
    <Formik
      initialValues={{ url: "" }}
      onSubmit={async ({ url }, { setSubmitting, resetForm }) => {
        console.log("Submitting now", url);
        setSubmitting(true);
        await addRepo({ url });
        setSubmitting(false);
        resetForm();
      }}
    >
      {() => (
        <Form>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Git Link ()
            </label>
            <div className="mt-2">
              <Field
                type="text"
                name="url"
                id="url"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
                aria-describedby="url-description"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500" id="url-description">
              Must be a public repository
            </p>
          </div>
        </Form>
      )}
    </Formik>
  );
};
