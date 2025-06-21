import { useEffect } from "react";
import { ExpandedRowT } from "./ExpandedRowT";

export function ExpandedRowWithLoad({
  occurrence,
  loadOptionsForOccurrence,
  ...rest
}) {
  useEffect(() => {
    loadOptionsForOccurrence(occurrence);
  }, [occurrence]);

  return <ExpandedRowT occurrence={occurrence} {...rest} />;
}
