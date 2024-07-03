import { format } from "date-fns";

export function pushError(errors: string[] = [], error: Error | string, $notify?: Function) {
  errors.push(`[${format(Date.now(), "HH:mm:ss")}] ${error}`);
  if ($notify)
    $notify({
      title: "Error",
      text: "" + error,
      type: "error",
    });
}

const AUTOMATED_SAMPLES = ["MATERIAL_SAMPLE", "MICROSCOPE_SAMPLE", "AGE", "HISTORY_SAMPLE", "XRF_SAMPLE"];

export function isAutomatedSample(sample: any) {
  if (!sample || !sample.additional_type) {
    return false;
  }
  return AUTOMATED_SAMPLES.includes(sample.additional_type);
}
