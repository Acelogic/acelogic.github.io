"""Build the portfolio's original iPod Classic model in Blender.
Run: blender --background --python scripts/model_ipod.py
"""
import bpy, math, pathlib, json
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'Assets'/'models'; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def material(name,color,metal=0,rough=.4):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bsdf=m.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(*color,1);bsdf.inputs['Metallic'].default_value=metal;bsdf.inputs['Roughness'].default_value=rough
 return m
silver=material('Anodized silver',(.64,.68,.72),.78,.32)
chrome=material('Polished stainless steel',(.66,.70,.75),1,.17)
white=material('Click wheel ceramic white',(.86,.87,.85),.05,.43)
center=material('Center button satin silver',(.75,.78,.79),.62,.34)
black=material('Screen gasket',(.014,.018,.025),.15,.3)
screen=material('LCD backing',(.012,.018,.025),0,.35)
glass=material('Display cover lens',(.97,.985,1),0,.085)
glass_bsdf=glass.node_tree.nodes.get('Principled BSDF')
glass_bsdf.inputs['Transmission Weight'].default_value=1
glass_bsdf.inputs['IOR'].default_value=1.5
ink=material('Wheel markings',(.44,.46,.47),0,.6)
orange=material('Hold switch indicator',(.9,.26,.04),0,.4)

def box(name,loc,dimensions,mat,bevel=.08,segments=6):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dimensions
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  m=o.modifiers.new('Machined edge radius','BEVEL');m.width=bevel;m.segments=segments
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
 o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 n=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');n.keep_sharp=True
 return o

def cylinder(name,x,y,z,radius,depth,mat):
 bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=radius,depth=depth,location=(x,y,z));o=bpy.context.object;o.name=name
 o.data.materials.append(mat);m=o.modifiers.new('Soft edge','BEVEL');m.width=.025;m.segments=3
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
 for p in o.data.polygons:p.use_smooth=True
 o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o

def label(name,text,loc,size,mat,rotation=(0,0,0)):
 bpy.ops.object.text_add(location=loc,rotation=rotation);o=bpy.context.object;o.name=name;o.data.body=text;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.size=size;o.data.extrude=.0008;o.data.materials.append(mat)
 bpy.ops.object.convert(target='MESH');return bpy.context.object

# Dimensions in centimeters, matching the proportions of the thin 160 GB Classic.
box('Stainless back',(0,0,-.15),(6.18,10.35,.75),chrome,.28,12)
box('Anodized aluminum face',(0,0,.28),(6.16,10.33,.5),silver,.26,12)
box('Display gasket',(0,2.5,.54),(5.13,3.91,.055),black,.105,8)
box('LCD backing',(0,2.5,.561),(4.84,3.63,.025),screen,.03,6)
box('Display glass',(0,2.5,.583),(4.89,3.66,.032),glass,.055,6)
cylinder('Wheel inset seam',0,-2.2,.55,2.04,.045,ink)
cylinder('Click wheel',0,-2.2,.576,2.015,.052,white)
cylinder('Center button seam',0,-2.2,.61,.785,.025,ink)
cylinder('Center button',0,-2.2,.635,.755,.052,center)
label('Menu label','MENU',(0,-.70,.61),.22,ink)
# Front symbols are real geometry, so they remain visible when the device rotates.
def triangle(name,x,y,z,direction):
 verts=[(x-.12*direction,y-.12,z),(x-.12*direction,y+.12,z),(x+.10*direction,y,z)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[(0,1,2)]);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(ink)
for x,direction,name in [(-1.47,-1,'Previous'),(1.47,1,'Next')]:
 triangle(name+' 1',x-.07,-2.2,.61,direction);triangle(name+' 2',x+.10,-2.2,.61,direction)
 box(name+' stop',(x+direction*.23,-2.2,.61),(.035,.24,.003),ink,.003,2)
triangle('Play',-.16,-3.69,.61,1)
for x in [.11,.22]:box('Pause',(x,-3.69,.61),(.055,.24,.003),ink,.002,2)
# Connector and controls on top and bottom, visible when inspecting the model.
box('Dock connector gasket',(0,-5.166,-.12),(2.24,.06,.40),black,.04,4)
box('Dock connector insert',(0,-5.20,-.12),(1.95,.04,.12),chrome,.02,3)
box('Hold inset',(-1.65,5.155,-.04),(.88,.07,.22),black,.035,4)
box('Hold orange',(-1.83,5.191,-.04),(.22,.02,.13),orange,.01,2)
box('Hold slider',(-1.53,5.205,-.04),(.40,.12,.16),chrome,.035,4)
jack=cylinder('Headphone jack',2.13,5.15,-.12,.19,.11,black);jack.rotation_euler.x=math.pi/2
rim=cylinder('Headphone jack metal rim',2.13,5.167,-.12,.23,.045,chrome);rim.rotation_euler.x=math.pi/2
# Recessed center makes the port read as a hole without expensive boolean topology.
hole=cylinder('Headphone port opening',2.13,5.20,-.12,.155,.012,black);hole.rotation_euler.x=math.pi/2
label('Back engraving','iPod',(0,1.5,-.538),.60,ink,(0,math.pi,0))
label('Portfolio engraving','Miguel Cruz  /  Acelogic',(0,-2.1,-.538),.17,ink,(0,math.pi,0))
label('Capacity engraving','160 GB',(0,-3.1,-.538),.23,ink,(0,math.pi,0))
# Export geometry only. The website lights it independently and places live HTML on the LCD.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(OUT/'ipod-classic.glb'),export_format='GLB',export_yup=False,export_apply=True,use_selection=True)
# Keep the editable source and an orthographic fallback render of this same model.
world=bpy.data.worlds.new('Soft studio');bpy.context.scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.35,.38,.43,1);world.node_tree.nodes['Background'].inputs[1].default_value=.7
for name,loc,power,size in [('Large softbox',(-5,7,10),1100,7),('Right strip',(7,1,7),950,5),('Top reflection',(0,8,3),600,4)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,0,24));camera=bpy.context.object;camera.name='Front product camera';camera.rotation_euler=(0,0,0);camera.data.type='ORTHO';camera.data.ortho_scale=11.0;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=660;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG';scene.render.filepath='//ipod-front.png'
scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'ipod-classic.blend'))
bpy.ops.render.render(write_still=True)
print('IPOD_MODEL_COMPLETE')
