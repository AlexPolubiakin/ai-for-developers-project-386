import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";
import "./models.tsp";
import "./routes.tsp";

using TypeSpec.Http;

@service({
  title: "CalClone Booking API",
  version: "1.0.0",
})
namespace CalClone;
