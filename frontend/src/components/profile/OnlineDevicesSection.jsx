import { Laptop, Smartphone, Tablet } from "lucide-react";

export default function OnlineDevicesSection({ watchBy, onlineDevices }) {
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case "laptop":
        return <Laptop className="w-5 h-5 text-blue-400" />;
      case "mobile":
        return <Smartphone className="w-5 h-5 text-green-400" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-center font-semibold text-gray-200">
        Online Devices
      </h3>
      <span className="text-sm text-blue-500">
        {`Your Device Current Limit is " ${watchBy[0].WatchBy} "`}
      </span>
      <div className="mt-2 space-y-2 p-1">
        {onlineDevices.map((device, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-gray-800/50 border border-gray-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mt-2 text-sm font-medium text-gray-200">
                  {device.deviceId}
                </p>
                <p className="mt-2 text-sm">
                  {new Date(device.lastAccessed).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-gray-400 flex items-center">
                  {getDeviceIcon(device.deviceDetails.deviceType)}
                  <span className="ml-2 capitalize">
                    {device.deviceDetails.deviceType}
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-400">Online</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
