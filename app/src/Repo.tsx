import { useAction, useQuery } from "convex/react";
import { Field, Formik } from "formik";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import Markdown from "react-markdown";
const Repo: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryRepo = useAction(api.actions.queryRepoAction);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const [replyId, setReplyId] = useState<Id<"anothertable">>("" as unknown);

  if (!id) navigate("/");
  if (!id) return <div>loading...</div>;
  return (
    <Formik
      initialValues={{ question: "", platform: "webflow" }}
      onSubmit={async ({ question, platform }) => {
        console.log("Oh noes I need to query the repO!!!");
        const answer = await queryRepo({
          question,
          platform,
          id: id as Id<"repos">,
        });
        // setMarkdown(answer.result.fullText);
        setReplyId(answer.id as Id<"anothertable">);
        console.log("Oh noes I did query the repO!!!");
      }}
    >
      {({ submitForm }) => (
        <div className="p-5 bg-gray-100 border-gray-200 border-1 shadow-sm m-5 rounded-md justify-start text-left">
          <label
            htmlFor="question"
            className="block text-sm font-medium leading-6 text-gray-900 text-left"
          >
            What do you want to do in webflow?
          </label>
          <div className="mt-2">
            <Field
              component="textarea"
              rows={4}
              name="question"
              id="question"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              //   defaultValue={""}
            />
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={submitForm}
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Ask for help
            </button>
          </div>

          {replyId && <Answer replyId={replyId} />}
        </div>
      )}
    </Formik>
  );
};
export default Repo;

const Answer: FC<{ replyId: string }> = ({ replyId }) => {
  const replyData = useQuery(api.anothertable.get, {
    id: replyId as Id<"anothertable">,
  });
  const [markdown, setMarkdown] = useState("");
  useEffect(() => {
    if (replyData?.reply) setMarkdown(replyData.reply);
  }, [replyData]);
  return (
    <article className="prose lg:prose-l">
      <Markdown>{markdown}</Markdown>
    </article>
  );
};
