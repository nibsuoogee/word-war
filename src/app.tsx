import { Dice3 } from "lucide-react";
import "./app.css";
import { Button } from "./components/ui/button";
import { Field, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { useState } from "preact/hooks";

export function App() {
  const [seed, setSeed] = useState<number>(0);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl">Word War</h1>

        <div className="flex items-end gap-2 w-full">
          <Field>
            <FieldLabel htmlFor="input-seed">Game seed</FieldLabel>
            <Input
              value={seed}
              onChange={(e) => setSeed(Number(e.currentTarget.value))}
              id="input-seed"
              type="number"
              placeholder="1234"
            />
          </Field>

          <Button variant="outline" size="icon" aria-label="Submit">
            <Dice3 />
          </Button>
        </div>

        <Button className="w-min" variant="outline">
          Start
        </Button>
      </div>
    </>
  );
}
