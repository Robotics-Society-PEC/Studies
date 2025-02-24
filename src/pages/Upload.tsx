import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { ChevronLeft, Upload as UploadIcon, Github, AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/ui/GithubHeader";
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
        const getAccessToken = () => {
            const hash = window.location.hash; // Get the full hash fragment
            const queryString = hash.split("?")[1]; // Extract query string after "?"

            if (!queryString) return null; // Return null if no query params exist

            const params = new URLSearchParams(queryString);
            return params.get("access_token");
        };

        const accessToken = getAccessToken();
        if (!accessToken) {
            // Redirect the user to GitHub's OAuth authorization page
            const redirectUri = "https://jukbfghyvachwjvwqpxz.supabase.co/functions/v1/callback"; // Supabase deployed function URL
            window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23li0s63G562CpnPqH&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
            return;
        }

        // Check if all necessary fields are filled
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
            // Fork the repo (this part is already done)
            const forkResponse = await fetch('https://api.github.com/repos/Robotics-Society-PEC/Studies/forks', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!forkResponse.ok) {
                throw new Error('Failed to fork the repository');
            }

            const forkData = await forkResponse.json();
            const forkedRepoOwner = forkData.owner.login; // The username of the forked repo
            const forkedRepoName = forkData.name;

            // Step 1: Convert the uploaded file to base64 (if it's a PDF)
            const fileContent = await readFileAsBase64(file);
            const encodedContent = fileContent.split(',')[1]; // Remove the base64 prefix

            // Step 2: Create a new blob (file) in the forked repository
            const blobResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    content: encodedContent,
                    encoding: 'base64',
                })
            });

            if (!blobResponse.ok) {
                throw new Error('Failed to create blob');
            }

            const blobData = await blobResponse.json();
            const blobSha = blobData.sha;  // Blob SHA to use in the tree

            // Step 3: Fetch paper.json file to modify it
            const fileResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/contents/src/data/papers.json`, {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!fileResponse.ok) {
                throw new Error('Failed to fetch paper.json');
            }

            const fileData = await fileResponse.json();
            const fileContentDecoded = atob(fileData.content);  // Decode the base64 content
            let paperData = JSON.parse(fileContentDecoded); // Parse JSON

            // Step 4: Check if courseCode exists and append the pyqs field
            let courseExists = false;
            for (const course of paperData) {
                if (course.course_code === courseCode) {
                    courseExists = true;
                    course.resources.pyqs.push({
                        year: year,
                        file: 'End-Term',  // You can modify this if needed
                    });
                    break;
                }
            }

            if (!courseExists) {
                // If the course doesn't exist, add a new entry
                paperData.push({
                    name: courseName,
                    course_code: courseCode,
                    resources: {
                        pyqs: [{
                            year: year,
                            file: 'End-Term',  // You can modify this if needed
                        }]
                    }
                });
            }

            // Step 5: Create a new blob with the updated papers.json content
            const updatedContent = JSON.stringify(paperData, null, 2);  // Format the JSON content

            const updatedBlobResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    content: btoa(updatedContent),  // Convert the updated content to base64
                    encoding: 'base64',
                })
            });

            if (!updatedBlobResponse.ok) {
                throw new Error('Failed to create updated blob');
            }

            const updatedBlobData = await updatedBlobResponse.json();
            const updatedBlobSha = updatedBlobData.sha;  // Updated blob SHA for the paper.json file

            // Step 6: Fetch the latest commit on the main branch to get the parents
            const latestCommitResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/commits/main`, {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!latestCommitResponse.ok) {
                throw new Error('Failed to fetch latest commit');
            }

            const latestCommitData = await latestCommitResponse.json();
            const parentCommitSha = latestCommitData.sha;  // Parent commit SHA

            // Step 7: Create a new tree that includes both changes (the papers.json and the PDF blob)
            const treeResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    base_tree: parentCommitSha,  // Using the latest commit as the base tree
                    tree: [
                        {
                            path: 'src/data/papers.json',  // The path to the file in the repository
                            mode: '100644',  // Regular file mode
                            type: 'blob',
                            sha: updatedBlobSha,
                        },
                        {
                            path: `Papers/${courseName}/${year}/End-Term.pdf`,  // The path to the new file
                            mode: '100644',  // Regular file mode
                            type: 'blob',
                            sha: blobSha,  // Blob SHA for the uploaded PDF
                        }
                    ]
                })
            });

            if (!treeResponse.ok) {
                throw new Error('Failed to create tree');
            }

            const treeData = await treeResponse.json();
            const treeSha = treeData.sha;

            // Step 8: Create a new commit that includes both changes
            const commitResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/git/commits`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    message: `Update papers.json and add End-Term PDF for ${courseCode} (${courseName}, ${year})`,
                    tree: treeSha,
                    parents: [parentCommitSha],  // Correct parent commit SHA
                })
            });

            if (!commitResponse.ok) {
                throw new Error('Failed to create commit');
            }

            const commitData = await commitResponse.json();
            const commitSha = commitData.sha;

            // Step 9: Update the reference (branch) to point to the new commit
            const refResponse = await fetch(`https://api.github.com/repos/${forkedRepoOwner}/${forkedRepoName}/git/refs/heads/main`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    sha: commitSha,  // The SHA of the commit we just created
                })
            });

            if (!refResponse.ok) {
                throw new Error('Failed to update the reference');
            }

            // Step 10: Create the pull request (same as before)
            const prResponse = await fetch('https://api.github.com/repos/Robotics-Society-PEC/Studies/pulls', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    title: `Add ${courseCode} paper for ${courseName}`,
                    head: forkedRepoOwner + ':main',
                    base: 'main',
                    body: `Added the question paper for ${courseName} (${courseCode}, ${year}).`
                })
            });

            if (!prResponse.ok) {
                throw new Error('Failed to create the pull request');
            }

            const prData = await prResponse.json();
            toast({
                title: "Success!",
                description: `Your pull request has been created: ${prData.html_url}`,
            });

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


    // Helper function to read a file as base64
    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file); // Read file as data URL (base64)
        });
    };




    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
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
