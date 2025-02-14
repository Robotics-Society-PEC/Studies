import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { ChevronLeft, Upload as UploadIcon, Github, AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Upload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [year, setYear] = useState("");

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (code) {
        }
    }, [location, toast]);


    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]?.type !== "application/pdf") {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF file",
                variant: "destructive",
            });
            return;
        }
        setFile(acceptedFiles[0]);
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !courseCode || !courseName || !year) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields and upload a PDF file",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {

            toast({
                title: "Success!",
                description: "Your paper has been submitted for review",
            });

            navigate("/");
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-8 text-gray-600 hover:text-gray-900"
                    onClick={() => navigate("/")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Papers
                </Button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upload Question Paper</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="courseName">Course Name</Label>
                            <Input
                                id="courseName"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="e.g., Data Structures"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="courseCode">Course Code</Label>
                            <Input
                                id="courseCode"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                placeholder="e.g., CS201"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g., 2023"
                                min="1900"
                                max={new Date().getFullYear()}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Question Paper (PDF)</Label>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
                                    isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300",
                                    file && "border-green-400 bg-green-50"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="text-center">
                                    {file ? (
                                        <>
                                            <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
                                            <p className="text-sm text-gray-600">{file.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">
                                                {isDragActive ? "Drop the file here" : "Drag & drop a PDF file here, or click to select"}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isUploading || !file}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Github className="mr-2 h-4 w-4" />
                                        Create Pull Request
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Upload;