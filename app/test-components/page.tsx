'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function TestComponentsPage() {
  const { toast } = useToast()

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">shadcn/ui Component Test Page</h1>
        <p className="text-muted-foreground">
          Testing all installed components with our custom Cerulean Blue + Emerald theme
        </p>
      </div>

      <Separator />

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>All button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🎨</Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-accent text-accent-foreground">Custom Accent</Badge>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Inputs, labels, and form elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="test-input-1">Email</Label>
            <Input id="test-input-1" type="email" placeholder="Enter your email..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-input-2">Password</Label>
            <Input id="test-input-2" type="password" placeholder="Enter password..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-input-3">Disabled</Label>
            <Input id="test-input-3" placeholder="Disabled input" disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Submit</Button>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog Component</CardTitle>
          <CardDescription>Modal dialogs and overlays</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Dialog</DialogTitle>
                <DialogDescription>
                  This is a test dialog using shadcn/ui components.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Dialog content goes here. You can put forms, text, or any other components inside
                  dialogs.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="dialog-input">Name</Label>
                  <Input id="dialog-input" placeholder="Enter name..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Dropdown Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Menu</CardTitle>
          <CardDescription>Context menus and dropdowns</CardDescription>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Table Component</CardTitle>
          <CardDescription>Data tables with proper styling</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of sample loan data</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">John Doe</TableCell>
                <TableCell>$10,000.00</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell className="text-right">$8,500.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jane Smith</TableCell>
                <TableCell>$15,000.00</TableCell>
                <TableCell>
                  <Badge variant="secondary">Pending</Badge>
                </TableCell>
                <TableCell className="text-right">$15,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bob Johnson</TableCell>
                <TableCell>$5,000.00</TableCell>
                <TableCell>
                  <Badge className="bg-accent text-accent-foreground">Completed</Badge>
                </TableCell>
                <TableCell className="text-right">$0.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs Component</CardTitle>
          <CardDescription>Tabbed navigation and content</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is the overview tab. It contains general information and summaries.
              </p>
            </TabsContent>
            <TabsContent value="details" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is the details tab. It contains detailed information and specifications.
              </p>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is the history tab. It contains historical data and timelines.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Toast */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>Temporary notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={() =>
              toast({
                title: 'Default Toast',
                description: 'This is a default toast notification.',
              })
            }
          >
            Show Default Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast({
                title: 'Error Toast',
                description: 'Something went wrong!',
                variant: 'destructive',
              })
            }
          >
            Show Error Toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: 'Success!',
                description: 'Your changes have been saved.',
              })
            }
          >
            Show Success Toast
          </Button>
        </CardContent>
      </Card>

      {/* Color Scheme Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Color Scheme</CardTitle>
          <CardDescription>Our Cerulean Blue (Primary) + Emerald (Accent) theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-md" />
              <p className="text-xs font-medium">Primary (Cerulean Blue)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-md" />
              <p className="text-xs font-medium">Secondary (Slate)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-accent rounded-md" />
              <p className="text-xs font-medium">Accent (Emerald)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-md" />
              <p className="text-xs font-medium">Destructive (Red)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
