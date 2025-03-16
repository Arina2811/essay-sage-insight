
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const History = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  // Placeholder data for demonstration
  const essays = [
    {
      id: 1,
      title: "The Impact of Technology",
      date: "Mar 15, 2024",
      score: 82,
      wordCount: 1250,
      category: "Technology",
      excerpt: "This essay explores how modern technology has transformed society...",
    },
    {
      id: 2,
      title: "Climate Change Solutions",
      date: "Mar 10, 2024",
      score: 78,
      wordCount: 1500,
      category: "Environment",
      excerpt: "A detailed analysis of potential solutions to address climate change...",
    },
    {
      id: 3,
      title: "Education in 2024",
      date: "Mar 5, 2024",
      score: 75,
      wordCount: 1100,
      category: "Education",
      excerpt: "An examination of current educational trends and future directions...",
    },
    {
      id: 4,
      title: "Healthcare Innovation",
      date: "Feb 28, 2024",
      score: 85,
      wordCount: 1700,
      category: "Health",
      excerpt: "This essay discusses breakthrough technologies in healthcare...",
    },
    {
      id: 5,
      title: "Economic Inequality",
      date: "Feb 20, 2024",
      score: 80,
      wordCount: 1450,
      category: "Economics",
      excerpt: "An analysis of growing economic disparities and potential solutions...",
    },
  ];

  // Filter essays based on search term and category filter
  const filteredEssays = essays.filter(essay => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          essay.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || essay.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Sort essays by date (newest first)
  const sortedEssays = [...filteredEssays].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Essay Library</h1>
          <p className="text-muted-foreground mt-2">
            Review your past essays and track your improvements
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search essays..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="economics">Economics</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "cards" | "table")}>
              <TabsList>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {viewMode === "cards" ? (
          <div className="space-y-4">
            {sortedEssays.map((essay) => (
              <Card key={essay.id} className="p-6 glass hover:bg-primary/5 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{essay.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {essay.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {essay.date}
                      </span>
                      <span>{essay.wordCount} words</span>
                      <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                        {essay.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="font-semibold">{essay.score}/100</div>
                    </div>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {sortedEssays.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No essays found matching your criteria.</p>
              </div>
            )}
          </div>
        ) : (
          <Card className="glass">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEssays.map((essay) => (
                  <TableRow key={essay.id}>
                    <TableCell className="font-medium">{essay.title}</TableCell>
                    <TableCell>{essay.date}</TableCell>
                    <TableCell>{essay.category}</TableCell>
                    <TableCell>{essay.wordCount}</TableCell>
                    <TableCell>{essay.score}/100</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {sortedEssays.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No essays found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
