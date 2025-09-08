import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PXRDData, TGAData } from '@/types/mpif';

interface DataVisualizationProps {
  pxrdData?: PXRDData;
  tgaData?: TGAData;
}

export function DataVisualization({ pxrdData, tgaData }: DataVisualizationProps) {
  if (!pxrdData && !tgaData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>
            Visualization will appear when characterization data is available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No characterization data available for visualization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* PXRD Visualization */}
      {pxrdData && pxrdData.data && pxrdData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>PXRD Pattern</CardTitle>
            <CardDescription>
              Powder X-Ray Diffraction pattern
              {pxrdData.source && ` (${pxrdData.source} Kα)`}
              {pxrdData.wavelength && `, λ = ${pxrdData.wavelength} Å`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pxrdData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="twoTheta" 
                    label={{ value: '2θ (degrees)', position: 'insideBottom', offset: -5 }}
                    type="number"
                    scale="linear"
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Intensity']}
                    labelFormatter={(value) => `2θ: ${value}°`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#3b82f6" 
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Data Points</p>
                <p className="text-muted-foreground">{pxrdData.data.length}</p>
              </div>
              <div>
                <p className="font-medium">2θ Range</p>
                <p className="text-muted-foreground">
                  {Math.min(...pxrdData.data.map(p => p.twoTheta)).toFixed(1)}° - {Math.max(...pxrdData.data.map(p => p.twoTheta)).toFixed(1)}°
                </p>
              </div>
              <div>
                <p className="font-medium">Max Intensity</p>
                <p className="text-muted-foreground">
                  {Math.max(...pxrdData.data.map(p => p.intensity)).toFixed(0)}
                </p>
              </div>
              <div>
                <p className="font-medium">Source</p>
                <p className="text-muted-foreground">{pxrdData.source || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TGA Visualization */}
      {tgaData && tgaData.data && tgaData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>TGA Curve</CardTitle>
            <CardDescription>
              Thermogravimetric Analysis - Weight loss vs Temperature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tgaData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="temperature" 
                    label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }}
                    type="number"
                    scale="linear"
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    label={{ value: 'Weight (%)', angle: -90, position: 'insideLeft' }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Weight']}
                    labelFormatter={(value) => `Temperature: ${value}°C`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weightPercent" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Data Points</p>
                <p className="text-muted-foreground">{tgaData.data.length}</p>
              </div>
              <div>
                <p className="font-medium">Temperature Range</p>
                <p className="text-muted-foreground">
                  {Math.min(...tgaData.data.map(p => p.temperature)).toFixed(0)}°C - {Math.max(...tgaData.data.map(p => p.temperature)).toFixed(0)}°C
                </p>
              </div>
              <div>
                <p className="font-medium">Weight Loss</p>
                <p className="text-muted-foreground">
                  {(Math.max(...tgaData.data.map(p => p.weightPercent)) - Math.min(...tgaData.data.map(p => p.weightPercent))).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="font-medium">Final Weight</p>
                <p className="text-muted-foreground">
                  {tgaData.data[tgaData.data.length - 1]?.weightPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 