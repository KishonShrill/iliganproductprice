import { Button } from "react-bootstrap";

export default function NoPage() {
  return (
    <div>
      <h1>Error 404</h1>
      <Button variant="primary" href="/">Go Back</Button>
    </div>
  );
}