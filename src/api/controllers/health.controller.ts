import { Request, Response } from "express";

export class HealthController {
  handle(_request: Request, response: Response): Response {
    return response.json({ status: "ok", service: "wppconnect-offers-api" });
  }
}
