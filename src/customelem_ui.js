import Plugin 				from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView 			from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {CustomElemCommand}  from './customelem_command';
import defaultIcon 			from '../theme/icons/default.svg';


export default class CustomElemUI extends Plugin {


	init() {
		const editor 		= this.editor;
		const items      	= editor.config.get(( 'CustomElement.items' ))

		
		for (let i=0; i<items.length; i++){
			const tag  		= items[i].tag;
			const text 		= items[i].placeholder;
			const attr 		= items[i].attributes;
			let   icon	 	= items[i].icon;

			if(typeof icon === 'undefined'){
				icon = defaultIcon;
			}
			else if (typeof icon === 'string'){
				if( icon.trim() === ''){
					icon = defaultIcon;
				}
			}


			///schema
			editor.model.schema.register(tag, {
				allowWhere: '$block',
				isObject: true
			}); 			
			editor.model.schema.extend( '$text', {
				allowIn: tag
			} );
			// editor.model.schema.register(tag, {
			// 	inheritAllFrom: '$block'
			// });



			//---conversion
			//editor.conversion.elementToElement({ model: tag, view: tag });
			editor.conversion.for( 'editingDowncast' ).add(
				downcastElementToElement( {
					model: tag,
					view: ( modelItem, viewWriter ) => {
						const widgetElement = viewWriter.createContainerElement( tag );
						return toWidget( widgetElement, viewWriter );
					}
				} )
			);
			editor.conversion.for( 'dataDowncast' ).add(
				downcastElementToElement( {
					model: tag,
					view: tag
				} )
			);	
			editor.conversion.for( 'upcast' ).add(
				upcastElementToElement( {
					view: tag,
					model: tag
				} )
			);



			//---command
			const com =  'custom-element-'+tag;
			editor.commands.add( com, new CustomElemCommand( editor, tag, text, attr  ) );

			//---toolbar
			this._createToolbarButton(com, icon);
			
		}		
		
	}

	
	_createToolbarButton(name, tbicon) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command = editor.commands.get( name );


			button.isEnabled = true;
			button.isOn      = true;
			button.label     = name;
			button.tooltip   = true;
			button.icon		 = tbicon;

			button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			this.listenTo( button, 'execute', () => editor.execute( name ) );

			return button;
		} );
	}

}

