import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function PdfViewerLightbox({ fileUrl }) {
  const layoutPlugin = defaultLayoutPlugin();

  return (
    <Worker workerUrl={pdfWorkerUrl}>
      <Viewer fileUrl={fileUrl} plugins={[layoutPlugin]} />
    </Worker>
  );
}
