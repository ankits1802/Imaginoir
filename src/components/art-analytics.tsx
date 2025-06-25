'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ArtAnalyticsProps {
  analysis: {
    textualAnalysis: string;
  };
  styleStrength: number;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export function ArtAnalytics({ analysis, styleStrength }: ArtAnalyticsProps) {
  const hasStyle = styleStrength > 0;
  const data = hasStyle
    ? [
        { name: 'Prompt Influence', value: 100 - styleStrength },
        { name: 'Style Influence', value: styleStrength },
      ]
    : [{ name: 'Prompt Influence', value: 100 }];

  const COLORS = hasStyle ? ['hsl(var(--primary))', 'hsl(var(--accent))'] : ['hsl(var(--primary))'];

  return (
    <Card className="shadow-lg transition-shadow duration-300 hover:shadow-glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="text-primary" />
          Artistic Influence Analysis
        </CardTitle>
        <CardDescription>How your inputs shaped the final image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasStyle && (
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                        }}
                    />
                    <Legend wrapperStyle={{color: 'hsl(var(--foreground))'}} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        )}
        <div>
          <h4 className="font-semibold mb-2">AI Art Critic's Notes:</h4>
          <p className="text-muted-foreground italic">"{analysis.textualAnalysis}"</p>
        </div>
      </CardContent>
    </Card>
  );
}
