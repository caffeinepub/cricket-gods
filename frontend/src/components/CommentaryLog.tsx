import { type Innings } from '../backend';
import { groupDeliveriesByOver } from '../lib/cricket';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface CommentaryLogProps {
  innings: Innings;
}

export default function CommentaryLog({ innings }: CommentaryLogProps) {
  const grouped = groupDeliveriesByOver(innings.deliveries);
  const lastOverNum = grouped.length > 0 ? grouped[grouped.length - 1][0].toString() : '';

  if (innings.deliveries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No deliveries recorded yet
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={[lastOverNum]}
      className="space-y-2"
    >
      {[...grouped].reverse().map(([overNum, deliveries]) => {
        const overRuns = deliveries.reduce((sum, d) => sum + Number(d.runs), 0);
        const overWickets = deliveries.filter(d => d.wicket).length;

        return (
          <AccordionItem
            key={overNum}
            value={overNum.toString()}
            className="bg-stadium-dark-card border border-stadium-dark-border rounded-lg px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 text-left">
                <span className="font-display font-bold text-cricket-gold">
                  Over {overNum}
                </span>
                <span className="text-sm text-muted-foreground">
                  {overRuns} runs
                  {overWickets > 0 && (
                    <span className="text-wicket-red ml-2">• {overWickets} wicket{overWickets > 1 ? 's' : ''}</span>
                  )}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-3">
                {deliveries.map((delivery, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-2 rounded text-sm ${
                      delivery.wicket
                        ? 'bg-wicket-red/10 border border-wicket-red/20'
                        : delivery.extras === 'wide' || delivery.extras === 'no-ball'
                        ? 'bg-cricket-gold/5 border border-cricket-gold/10'
                        : 'bg-stadium-dark-elevated/50'
                    }`}
                  >
                    <span className="font-display text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                      {overNum}.{delivery.ballNumber.toString()}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      {delivery.wicket && (
                        <Badge className="bg-wicket-red/20 text-wicket-red border-wicket-red/30 text-xs">
                          WICKET
                        </Badge>
                      )}
                      {delivery.extras === 'wide' && (
                        <Badge className="bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30 text-xs">
                          WIDE
                        </Badge>
                      )}
                      {delivery.extras === 'no-ball' && (
                        <Badge className="bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30 text-xs">
                          NO BALL
                        </Badge>
                      )}
                      <span className={`font-display font-bold ${
                        delivery.wicket ? 'text-wicket-red' :
                        Number(delivery.runs) === 4 ? 'text-cricket-green' :
                        Number(delivery.runs) === 6 ? 'text-cricket-gold' :
                        'text-foreground'
                      }`}>
                        {delivery.runs.toString()}
                      </span>
                      <span className="text-muted-foreground">{delivery.commentary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
