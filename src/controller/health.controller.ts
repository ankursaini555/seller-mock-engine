import { Request, Response } from "express";
import { checkHealth, JsonResponseToText } from "../utils/healthCheck";

export const healthCheckAPI = async (req: Request, res: Response) => {
  try {
    // Define the current service and its dependencies
    const currentService = {
      name: "Seller Mock Engine",
      url:
        process.env.DEPLOYED_URL + "/health-self" ||
        "http://localhost:7202/health-self", // check current service by session api route
    };

    const dependencyServices = [
      {
        name: "Protocol Server Engine",
        url:
          process.env.PROTOCOL_SERVER_BASE_URL + "health-self" ||
          "http://localhost:7201/health-self",
      },
      {
        name: "Mock UI",
        url: process.env.MOCK_UI_URL || "http://localhost:3000",
      },
    ];

    const healthStatus = await checkHealth(currentService, dependencyServices);
    const textResponse = JsonResponseToText(healthStatus);
    res.setHeader("Content-Type", "text/plain");
    res.status(healthStatus.statusCode).send(textResponse);
  } catch (error) {
    console.error("Error in healthCheckAPI:", error);
    res.status(500).send({
      message: "An error occurred while processing the health check.",
      error: error,
    });
  }
};
