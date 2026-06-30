import { EmberCanvas } from './ember-canvas';

export function BackgroundField() {
  return (
    <>
      <div className="bg-field" aria-hidden>
        <div className="bg-grad" />
        <div className="bg-grid" />
      </div>
      <EmberCanvas />
    </>
  );
}
