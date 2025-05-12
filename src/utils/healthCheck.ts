import axios from "axios";

export const checkHealth = async (
  currentService: { name: string; url: string },
  dependencyServices?: { name: string; url: string }[]
) => {
  console.log({ currentService, dependencyServices });
  const response: {
    name: string;
    status: string;
    dependencyServices: { name: string; status: string }[];
  } = {
    name: currentService.name,
    status: "down",
    dependencyServices: [],
  };

  // Check the status of the current service
  try {
    const currentServiceResult = await axios.get(currentService.url);
    response.status = currentServiceResult.status === 200 ? "up" : "down";
  } catch {
    response.status = "down";
  }

  // Check the status of dependency services if provided
  if (dependencyServices && Array.isArray(dependencyServices)) {
    const dependencyChecks = await Promise.allSettled(
      dependencyServices.map(async (service) => {
        try {
          const result = await axios.get(service.url, { timeout: 5000 });
          return {
            name: service.name,
            status: result.status === 200 ? "up" : "down",
          };
        } catch {
          return {
            name: service.name,
            status: "down",
          };
        }
      })
    );

    // Map the results to extract statuses
    response.dependencyServices = dependencyChecks.map((check, index) => {
      console.log(check);
      if (check.status === "fulfilled") {
        console.log("true");
        return check.value;
      } else {
        console.log("false");
        return {
          name: dependencyServices[index].name,
          status: "down",
        };
      }
    });
  }

  return response;
};
