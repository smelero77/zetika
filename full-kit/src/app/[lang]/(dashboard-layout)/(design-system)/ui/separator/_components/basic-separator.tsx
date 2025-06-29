"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function BasicSeparator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Separator</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Radix Primitives
            </h4>
            <p className="text-sm text-muted-foreground">
              An open-source UI component library.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="h-5 flex items-center gap-x-4 text-sm">
            <div>Blog</div>
            <Separator orientation="vertical" />
            <div>Docs</div>
            <Separator orientation="vertical" />
            <div>Source</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
