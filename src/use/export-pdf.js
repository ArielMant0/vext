import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function useExportPDF() {

    let _x = 20;
    let _y = 20;
    let _fontSize = 11;
    const _width = 170;
    const _conv = 0.45;

    const DEFAULT_OPTIONS = Object.freeze({
        orientation: "portrait",
        unit: "mm",
        format: "A4",
        fontSize: 11,
    });

    function addVerticalSpace(pdf, size) {
        _y += size;
    }

    function addEmptyLine(pdf, fontSize=_fontSize) {
        addVerticalSpace(pdf, Math.max(4, fontSize * _conv * pdf.getLineHeightFactor()))
    }

    function createPDF(options={}) {
        _x = 20;
        _y = 20;
        if (options.fontSize) _fontSize = options.fontSize;
        else _fontSize = DEFAULT_OPTIONS.fontSize;
        return new jsPDF(Object.create(DEFAULT_OPTIONS, options));
    }

    function createImage(node, imageType="png") {
        switch(imageType.toLowerCase()) {
            case "jpg":
            case "jpeg":
                return toJpeg(node);
            case "png":
            default:
                return toPng(node);
        }
    }

    function addText(pdf, text, fontSize=_fontSize) {
        pdf.setFontSize(fontSize);
        pdf.text(text, _x, _y);
        addEmptyLine(pdf, fontSize);
    }

    function addImage(pdf, image, w, h, imageType="JPEG") {
        const height = Math.floor(_width * (h / w));
        pdf.addImage(image, imageType, _x, _y, _width, height);
        _y += height;
        addEmptyLine(pdf);
    }

    async function addImageFromHTML(pdf, node, w, h, imageType="JPEG") {
        const canvas = await html2canvas(node, { width: w, height: h });
        return addImageFomCanvas(pdf, canvas, imageType);
    }

    function addImageFomCanvas(pdf, canvas, imageType="JPEG") {
        const height = Math.floor(_width * (canvas.height / canvas.width));
        pdf.addImage(canvas, imageType, _x, _y, _width, height);
        _y += height;
        addEmptyLine(pdf);
    }

    function savePDF(pdf, name="export") {
        pdf.save(name.endsWith(".pdf") ? name : name+".pdf")
    }

    function outputPDF(pdf, name="export") {
        return pdf.output("blob", name.endsWith(".pdf") ? name : name+".pdf")
    }

    return {
        createPDF,
        createImage,
        addImage,
        addImageFomCanvas,
        addImageFromHTML,
        addText,
        addVerticalSpace,
        savePDF,
        outputPDF
    }
}