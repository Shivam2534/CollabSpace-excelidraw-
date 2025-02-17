type shapeType =
  | {
      type: "rect";
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      color: string;
      x: number;
      y: number;
      radius: number;
      startAngle: number;
      endAngle: number;
    }
  | {
      type: "arrow";
      color: string;
      fromx: number;
      fromy: number;
      tox: number;
      toy: number;
    }
  | {
      type: "line";
      color: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "pencil";
      color: string;
      path: { x: number; y: number }[];
    }
  | {
      type: "any";
      shape: any;
    };

export default shapeType;
