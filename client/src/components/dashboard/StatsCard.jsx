import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  onClick
}) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              'flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm',
              'bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10',
              iconColor
            )}>
              <Icon className="h-6 w-6" />
            </div>
            {change && (
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors',
                changeType === 'positive' && 'bg-green-500/10 text-green-600',
                changeType === 'negative' && 'bg-red-500/10 text-red-600',
                changeType === 'neutral' && 'bg-muted/50 text-muted-foreground'
              )}>
                <span>{change}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                {value}
              </h3>
            </div>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary/30 transition-all duration-500 group-hover:w-full" />
      </CardContent>
    </Card>);
}