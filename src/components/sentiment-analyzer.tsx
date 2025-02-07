'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HeartIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from './ui/toast';

interface SentimentResult {
  alg_type: string;
  kind_of_sentiment: 'Positive' | 'Neutral' | 'Negative';
  review: string;
}

interface ApiResponse {
  data: {
    sentiment: SentimentResult[];
  };
  status: string;
}

const FormSchema = z.object({
  text: z
    .string({
      message: 'Please insert some sentences to analyze.',
    })
    .min(5, {
      message: 'Sentence must be at least 5 characters.',
    }),
});

export default function SentimentAnalyzer() {
  const [model, setModel] = useState<string>('MFNb - V1');
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    const reviews = data.text
      .split('.')
      .filter((review) => review.trim() !== '')
      .map((review) => ({ reviewr: review.trim() }));

    const requestBody = {
      reviews: reviews,
      model: model.split(' - ')[0], // Extract model name without version
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analyze-sentiment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Internal Server Error',
          description: 'Uh oh! Something went wrong in server.',
          action: <ToastAction altText='Try again'>Try again</ToastAction>,
        });
      }

      const data: ApiResponse = await response.json();
      setResults(data.data.sentiment);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Internal Server Error',
        description: 'Uh oh! Something went wrong in server.',
        action: <ToastAction altText='Try again'>Try again</ToastAction>,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-500/25 group-hover:bg-green-500/20  text-green-500';
      case 'Neutral':
        return 'bg-yellow-500/25 group-hover:bg-yellow-500/20  text-yellow-500';
      case 'Negative':
        return 'bg-red-500/25 group-hover:bg-red-500/20  text-red-500';
      default:
        return 'bg-gray-500/25 group-hover:bg-gray-500/20  text-gray-500';
    }
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>🐈 Meowsenti Analyzer</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between w-full'>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Select model' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='MFNb - V1'>MFNb - V1</SelectItem>
              <SelectItem value='MFSvc - V1'>MFSvc - V1</SelectItem>
            </SelectContent>
          </Select>
          <span className='text-sm text-gray-600 hidden md:block'>
            Total reviews analyzed: {results.length}
          </span>
        </div>
        <div className='space-y-4 border rounded-xl min-h-64 h-64 p-4 flex flex-col justify-between'>
          {results.length > 0 && !isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50%]'>Text</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Algorithm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className='font-medium'>
                      {result.review}
                    </TableCell>
                    <TableCell className='group'>
                      <Badge
                        className={`${getSentimentColor(
                          result.kind_of_sentiment
                        )}`}
                      >
                        {result.kind_of_sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.alg_type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='flex w-full h-full items-center justify-center text-sm'>
              {isLoading ? (
                <div className='flex flex-col gap-3 items-center'>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <rect
                      className='spinner_9y7u'
                      x='1'
                      y='1'
                      rx='1'
                      width='10'
                      height='10'
                    />
                    <rect
                      className='spinner_9y7u spinner_DF2s'
                      x='1'
                      y='1'
                      rx='1'
                      width='10'
                      height='10'
                    />
                    <rect
                      className='spinner_9y7u spinner_q27e'
                      x='1'
                      y='1'
                      rx='1'
                      width='10'
                      height='10'
                    />
                  </svg>

                  <span>Analyzing sentiment from text...</span>
                </div>
              ) : (
                'The result will be appears here.'
              )}
            </div>
          )}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <FormField
              control={form.control}
              name='text'
              render={({ field }) => (
                <FormItem>
                  <FormMessage />
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder='Enter one or more sentences to analyze. Separate sentences with a period.'
                      className='resize-none w-full text-sm'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Analyzing....' : 'Analyze Sentiment'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='text-sm text-gray-500'>
        Crafted with <HeartIcon size={15} className='mx-1 text-red-500' /> by{' '}
        <a
          href='https://mframadan.dev'
          target='_blank'
          className='mx-1 text-emerald-700 hover:underline'
        >
          @mframadan.dev
        </a>
      </CardFooter>
    </Card>
  );
}
