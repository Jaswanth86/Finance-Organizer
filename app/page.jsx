import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ArrowRightIcon, BarChart3, PieChart, WalletIcon, ListChecksIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-1 p-6 lg:px-8">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Personal Finance Visualizer
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Track, visualize, and manage your personal finances with ease. Get insights into your spending habits and take control of your financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/transactions">
                Manage Transactions
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need to manage your personal finances in one place.
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col items-center">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-full">
                <WalletIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Transaction Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Easily log and categorize all your income and expenses in one place.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="ghost" asChild>
                <Link href="/transactions">
                  Learn more <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col items-center">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Visual Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Visualize your spending patterns and income sources with interactive charts.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  Learn more <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col items-center">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-full">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Category Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>See where your money goes with detailed category-based spending analysis.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  Learn more <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col items-center">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-full">
                <ListChecksIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Budget Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Set up and track budgets for different spending categories to stay on top of your finances.</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="ghost" asChild>
                <Link href="/budgets">
                  Learn more <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Start tracking your finances today and make informed decisions about your money.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/dashboard">
              Get Started <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}