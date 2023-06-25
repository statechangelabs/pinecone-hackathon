import { useParams } from "react-router-dom";

const Repo: FC = () => {
  const { id } = useParams();
  return <div>{id}</div>;
};
export default Repo;
