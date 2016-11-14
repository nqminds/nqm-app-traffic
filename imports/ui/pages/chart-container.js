import {composeWithTracker} from "react-komposer";
import Chart from "../components/chart";
import ProgressIndicator from "../components/progress-indicator"
import loadResourceData from "../../api/manager/load-resource-tdxapi";

// Use the loadResourceData composer to populate the "data" property of the ResourceData component.
export default composeWithTracker(loadResourceData, ProgressIndicator)(Chart);