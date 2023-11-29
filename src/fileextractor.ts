import JSZip from 'jszip';


export interface FileExtractor {

    extract(src: File): Promise<File | Blob | null>;

}

export class PassFileExtractor implements FileExtractor {

    public async extract(src: File): Promise<File> {
	return src;
    }

}

export class ZipFileExtractor implements FileExtractor {

    protected path: string;

    constructor(path: string) {
	this.path = path;
    }

    public async extract(src: File): Promise<Blob | null> {
	return JSZip.loadAsync(src).then((zip) => {
	    var doc = zip.file(this.path);
	    return doc?.async("blob").then((data) => {
		return data;
	    }) ?? null;
	});
    }
}


export class FileExtractorFactory {

    public static getFileExtractor(file: File): FileExtractor {
	var ext = file.name.split('.').pop();
	if (ext === "odt") {
	    return new ZipFileExtractor("content.xml");
	} else if (ext === "docx") {
	    return new ZipFileExtractor("word/document.xml");
	} else {
	    return new PassFileExtractor();
	}
    }

}
