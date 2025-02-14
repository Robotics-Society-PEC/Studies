
import { useState } from "react";
import { Search, Upload, Book } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PaperViewer from "@/components/PaperViewer";
import { useToast } from "@/hooks/use-toast";
import data from "@/data/papers.json";

type CourseResource = {
  year: number;
  file: string;
};

type Course = {
  name: string;
  course_code: string;
  resources: {
    pyqs: CourseResource[];
  };
};


const Index = () => {
  const [papers] = useState<Course[]>(data);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredPapers = papers.filter(paper =>
    paper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Punjab Engineering College</h1>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Question Paper Repository</h1>
          <p className="text-lg text-gray-600">Access previous year question papers</p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search papers by Name or Code..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* <div>
            <Button className="gap-2" onClick={() => window.location.href = '/upload'}>
              <Upload className="h-4 w-4" />
              Upload Paper
            </Button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <Dialog key={paper.course_code}>
              <DialogTrigger asChild>
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <Book className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{paper.name}</h3>
                      <p className="text-sm text-gray-500">{paper.course_code}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    {/* <span className="text-sm text-gray-600">Course Code: {paper.course_code}</span> */}
                    <Button variant="ghost" size="sm">View Paper</Button>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{paper.name}</DialogTitle>
                </DialogHeader>
                {paper.resources.pyqs.map((resource) => (
                  <PaperViewer
                    key={resource.year}
                    url={
                      import.meta.env.MODE === "development"
                        ? `/public/../Papers/${paper.name}/${resource.year}/${resource.file}.pdf`
                        : `https://raw.githubusercontent.com/Robotics-Society-PEC/Studies/main/Papers/${encodeURIComponent(paper.name)}/${resource.year}/${resource.file}.pdf`
                    }
                  />
                ))}
              </DialogContent>
            </Dialog>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Index;
