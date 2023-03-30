import JSZip from "jszip";
import { saveAs } from "file-saver";

export function useExportZIP() {

    function createZIP() {
        return new JSZip();

    }

    function addObjectAsFile(zip, filename, obj) {
        const blob = new Blob(
            [JSON.stringify(obj, null, 2)],
            { type: "application/json" }
        );
        addFile(zip, filename, blob)
    }

    function addFile(zip, filename, blob) {
        zip.file(filename, blob)
    }

    async function downloadZIP(zip, filename, onError=(err) => console.err(err)) {
        const name = filename.endsWith(".zip") ? filename : filename+".zip";
        return zip.generateAsync({type:"blob"})
            .then(blob => saveAs(blob, name), onError);
    }

    return {
        createZIP,
        addObjectAsFile,
        addFile,
        downloadZIP
    }
}