import { Card, CardBody } from "@nextui-org/card";
import { subtitle, title } from "./primitives";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Divider } from "@nextui-org/divider";

const SurveyCard = ({ statement, description }: {
  statement: string,
  description: string
}) => {
  return (
    <Card>
      <CardBody>
        <h1 className="text-xl">{statement}</h1>
        <Divider />
        <p className="text-md">{description}</p>
        <Spacer y={4} />
        <ButtonGroup>
          <Button className="backdrop-brightness-75 bg-red-600/75 hover:bg-red-800/75 text-white">Strongly Disagree</Button>
          <Button className="backdrop-brightness-75 bg-red-500/75 hover:bg-red-700/75 text-white">Disagree</Button>
          <Button className="backdrop-brightness-75 bg-gray-500/75 hover:bg-gray-700/75 text-white">No Opinion</Button>
          <Button className="backdrop-brightness-75 bg-green-500/75 hover:bg-green-700/75 text-white">Agree</Button>
          <Button className="backdrop-brightness-75 bg-green-600 hover:bg-green-800/75 text-white">Strongly Agree</Button>
        </ButtonGroup>
      </CardBody>
    </Card>
  );
};

export default SurveyCard;
