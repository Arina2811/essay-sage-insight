
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Search, Filter, Calendar, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupabaseEssayService } from "@/services/SupabaseEssayService";
import { EssayData } from "@/types/essay";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const History = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const navigate = useNavigate();
  
  // Fetch essays using React Query
  const { data: essays = [], isLoading, error, refetch } = useQuery({
    queryKey: ['essays'],
    queryFn: SupabaseEssayService.getEssays,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Set up realtime subscription
  useEffect(() => {
    // Subscribe to changes in the essays table
    const channel = supabase
      .channel('essay_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'essay_analyses'
        },
        () => {
          // Refetch data when changes occur
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filter essays based on search term and category filter
  const filteredEssays = essays.filter((essay: EssayData) => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || getEssayCategory(essay) === filter;
    return matchesSearch && matchesFilter;
  });

  // Sort essays by date (newest first)
  const sortedEssays = [...filteredEssays].sort((a: EssayData, b: EssayData) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  // Helper function to get essay category (based on keywords in title)
  function getEssayCategory(essay: EssayData): string {
    const title = essay.title.toLowerCase();
    if (title.includes('technology') || title.includes('tech') || title.includes('digital')) return 'technology';
    if (title.includes('environment') || title.includes('climate') || title.includes('nature')) return 'environment';
    if (title.includes('education') || title.includes('learning') || title.includes('school')) return 'education';
    if (title.includes('health') || title.includes('medical') || title.includes('wellness')) return 'health';
    if (title.includes('economy') || title.includes('economic') || title.includes('finance')) return 'economics';
    return 'other';
  }

  // Format date for display
  function formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Helper function to get word count from essay content
  function getWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  // View a specific essay (placeholder for future implementation)
  function viewEssay(essay: EssayData) {
    // For now, just log the essay - future implementation would navigate to a detail view
    console.log("Viewing essay:", essay);
    // Navigate to the dashboard as a placeholder
    navigate('/dashboard');
  }

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
                <SelectItem value="other">Other</SelectItem>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your essays...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading essays. Please try again later.</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="space-y-4">
            {sortedEssays.map((essay: EssayData) => (
              <Card key={essay.id} className="p-6 glass hover:bg-primary/5 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{essay.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {essay.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(essay.created_at)}
                      </span>
                      <span>{getWordCount(essay.content)} words</span>
                      <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                        {getEssayCategory(essay)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="font-semibold">{essay.analysis?.score || 0}/100</div>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => viewEssay(essay)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {sortedEssays.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No essays found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/analysis')}>
                  Analyze a New Essay
                </Button>
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
                {sortedEssays.map((essay: EssayData) => (
                  <TableRow key={essay.id}>
                    <TableCell className="font-medium">{essay.title}</TableCell>
                    <TableCell>{formatDate(essay.created_at)}</TableCell>
                    <TableCell>{getEssayCategory(essay)}</TableCell>
                    <TableCell>{getWordCount(essay.content)}</TableCell>
                    <TableCell>{essay.analysis?.score || 0}/100</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => viewEssay(essay)}>
                        <Eye className="h-4 w-4" />
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
