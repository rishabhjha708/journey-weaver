import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { JourneyNodeData, NodeCategory } from '@/types/journey';
import { getTemplateByType } from '@/data/nodeTemplates';
import { cn } from '@/lib/utils';

interface NodeEditorProps {
  node: JourneyNodeData | null;
  onUpdate: (data: Partial<JourneyNodeData>) => void;
  onClose: () => void;
}

const categoryColors: Record<NodeCategory, string> = {
  trigger: 'bg-[hsl(var(--node-trigger))]',
  action: 'bg-[hsl(var(--node-action))]',
  condition: 'bg-[hsl(var(--node-condition))]',
  flow: 'bg-[hsl(var(--node-flow))]',
};

export function NodeEditor({ node, onUpdate, onClose }: NodeEditorProps) {
  const [config, setConfig] = useState<Record<string, any>>(node?.config || {});
  const template = node ? getTemplateByType(node.type) : null;
  const IconComponent = template 
    ? (LucideIcons as any)[template.icon] || LucideIcons.Circle 
    : LucideIcons.Circle;

  if (!node || !template) return null;

  const handleSave = () => {
    onUpdate({ config, isConfigured: true });
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-80 border-l border-border bg-sidebar-background flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-md', categoryColors[node.category])}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">{template.label}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </div>

      {/* Configuration Form */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-4">
          {/* Render config fields based on node type */}
          {renderConfigFields(node.type, config, updateConfig)}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </motion.div>
  );
}

function renderConfigFields(
  nodeType: string,
  config: Record<string, any>,
  updateConfig: (key: string, value: any) => void
) {
  switch (nodeType) {
    // Triggers
    case 'occurrence-of-event':
      return (
        <>
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input
              placeholder="e.g., purchase_completed"
              value={config.eventName || ''}
              onChange={(e) => updateConfig('eventName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Event Properties (Optional)</Label>
            <Textarea
              placeholder="Add event property conditions..."
              value={config.eventProperties || ''}
              onChange={(e) => updateConfig('eventProperties', e.target.value)}
              rows={3}
            />
          </div>
        </>
      );

    case 'enter-segment':
    case 'exit-segment':
    case 'is-in-segment':
      return (
        <div className="space-y-2">
          <Label>Select Segment</Label>
          <Select
            value={config.segmentId || ''}
            onValueChange={(v) => updateConfig('segmentId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="segment-1">Active Premium Users</SelectItem>
              <SelectItem value="segment-2">Cart Abandoners</SelectItem>
              <SelectItem value="segment-3">High Value Customers</SelectItem>
              <SelectItem value="segment-4">Inactive Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    // Actions - Email
    case 'send-email':
      return (
        <>
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select
              value={config.templateId || ''}
              onValueChange={(v) => updateConfig('templateId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template-1">Welcome Email</SelectItem>
                <SelectItem value="template-2">Cart Reminder</SelectItem>
                <SelectItem value="template-3">Special Offer</SelectItem>
                <SelectItem value="template-4">Newsletter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject Line</Label>
            <Input
              placeholder="Enter email subject"
              value={config.subject || ''}
              onChange={(e) => updateConfig('subject', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sender Name</Label>
            <Input
              placeholder="e.g., Acme Team"
              value={config.senderName || ''}
              onChange={(e) => updateConfig('senderName', e.target.value)}
            />
          </div>
        </>
      );

    // Actions - SMS/WhatsApp
    case 'send-sms':
    case 'send-whatsapp':
      return (
        <>
          <div className="space-y-2">
            <Label>Message Template</Label>
            <Select
              value={config.templateId || ''}
              onValueChange={(v) => updateConfig('templateId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms-1">Order Confirmation</SelectItem>
                <SelectItem value="sms-2">OTP Message</SelectItem>
                <SelectItem value="sms-3">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message Content</Label>
            <Textarea
              placeholder="Enter message content..."
              value={config.content || ''}
              onChange={(e) => updateConfig('content', e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Use {'{'}first_name{'}'} for personalization
            </p>
          </div>
        </>
      );

    // Actions - Push
    case 'send-push':
    case 'send-web-push':
      return (
        <>
          <div className="space-y-2">
            <Label>Notification Title</Label>
            <Input
              placeholder="Enter title"
              value={config.title || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notification Body</Label>
            <Textarea
              placeholder="Enter message body..."
              value={config.body || ''}
              onChange={(e) => updateConfig('body', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Click Action URL</Label>
            <Input
              placeholder="https://..."
              value={config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
            />
          </div>
        </>
      );

    // Actions - Webhook
    case 'call-api':
      return (
        <>
          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <Select
              value={config.method || 'POST'}
              onValueChange={(v) => updateConfig('method', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Endpoint URL</Label>
            <Input
              placeholder="https://api.example.com/webhook"
              value={config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Request Body (JSON)</Label>
            <Textarea
              placeholder='{"key": "value"}'
              value={config.body || ''}
              onChange={(e) => updateConfig('body', e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
          </div>
        </>
      );

    // Flow - Wait
    case 'wait-time':
      return (
        <>
          <div className="space-y-2">
            <Label>Wait Duration</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={config.duration || 1}
                onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
                className="w-24"
              />
              <Select
                value={config.unit || 'hours'}
                onValueChange={(v) => updateConfig('unit', v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      );

    case 'wait-event':
      return (
        <>
          <div className="space-y-2">
            <Label>Wait for Event</Label>
            <Input
              placeholder="e.g., purchase_completed"
              value={config.eventName || ''}
              onChange={(e) => updateConfig('eventName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Timeout Duration</Label>
            <Select
              value={config.timeout || '7d'}
              onValueChange={(v) => updateConfig('timeout', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="3d">3 Days</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="14d">14 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    // Conditions
    case 'check-user-attribute':
      return (
        <>
          <div className="space-y-2">
            <Label>User Attribute</Label>
            <Select
              value={config.attribute || ''}
              onValueChange={(v) => updateConfig('attribute', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="plan">Plan Type</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="ltv">Lifetime Value</SelectItem>
                <SelectItem value="signup_date">Signup Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select
              value={config.operator || 'equals'}
              onValueChange={(v) => updateConfig('operator', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Does not equal</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
                <SelectItem value="is_set">Is set</SelectItem>
                <SelectItem value="is_not_set">Is not set</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              placeholder="Enter value"
              value={config.value || ''}
              onChange={(e) => updateConfig('value', e.target.value)}
            />
          </div>
        </>
      );

    case 'has-done-event':
      return (
        <>
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input
              placeholder="e.g., purchase"
              value={config.eventName || ''}
              onChange={(e) => updateConfig('eventName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Time Frame</Label>
            <Select
              value={config.timeframe || '7d'}
              onValueChange={(v) => updateConfig('timeframe', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1 hour</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ever">Ever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'split':
      return (
        <>
          <div className="space-y-2">
            <Label>Split Type</Label>
            <Select
              value={config.splitType || 'percentage'}
              onValueChange={(v) => updateConfig('splitType', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage Split</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--node-action))]" />
                <span className="text-sm font-medium">Branch A</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={config.branchA || 50}
                  onChange={(e) => updateConfig('branchA', parseInt(e.target.value))}
                  className="w-16 h-8 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--node-flow))]" />
                <span className="text-sm font-medium">Branch B</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={config.branchB || 50}
                  onChange={(e) => updateConfig('branchB', parseInt(e.target.value))}
                  className="w-16 h-8 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </>
      );

    default:
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Configuration options coming soon</p>
        </div>
      );
  }
}
