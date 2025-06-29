"use client"

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function InputOtpPattern() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input OTP Pattern</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
    </Card>
  )
}
