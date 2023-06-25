import { Formik, Form, Field } from "formik";
import { FC } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
const Query: FC = () => {
  const addAThing = useMutation(api.mutations.myMutationFunction);
  return (
    <Formik
      initialValues={{
        url: "",
        query: "",
        platform: "",
      }}
      onSubmit={({ url, query, platform }) => {
        console.log(url, query, platform);
        addAThing({ url, query, platform });
      }}
    >
      <Form>
        <Field
          className="form-input px-4 py-3 rounded-full"
          name="url"
          label="URL"
        />
        <Field
          className="form-input px-4 py-3 rounded-full"
          name="query"
          label="Query"
        />
        <Field
          className="form-input px-4 py-3 rounded-full"
          name="platform"
          label="Platform"
        />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
};
export default Query;
