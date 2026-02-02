import { PlayingCard } from "@/components/playingCard/playingCard";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowLeft, Play, Trophy, X } from "lucide-react";
import { useState } from "preact/hooks";

export function Game({ quit }: { quit: () => void }) {
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

  function buttons() {
    switch (quitDialogOpen) {
      case false:
        return (
          <>
            <Button
              onClick={() => setQuitDialogOpen(true)}
              className="ml-auto"
              variant="secondary"
            >
              Quit
              <ArrowLeft />
            </Button>
          </>
        );
      case true:
        return (
          <>
            <Button onClick={quit} className="mr-auto" variant="destructive">
              <ArrowLeft />
              Yes, quit...
            </Button>

            <Button
              onClick={() => setQuitDialogOpen(false)}
              className="ml-auto"
              variant="outline"
            >
              Keep playing
              <Play />
            </Button>
          </>
        );
      default:
        return <></>;
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 w-min mx-auto">
        <Button onClick={() => null} className="" size="icon" variant="outline">
          <ArrowDown />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => null}
            className=""
            size="icon"
            variant="outline"
          >
            <X />
          </Button>

          <div className="flex flex-col gap-2">
            <PlayingCard
              category="asdf"
              symbol={`./src/assets/symbols/${"pause"}.svg`}
            />
            <div className="flex justify-center w-full">{buttons()}</div>
          </div>

          <Button
            onClick={() => null}
            className=""
            size="icon"
            variant="outline"
          >
            <Trophy />
          </Button>
        </div>
      </div>
    </>
  );
}
