<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { uuidv4 } from 'lib/crypto/uuid';

  import { addContact, getContacts } from 'popup/backend/contacts';

  const dispatch = createEventDispatcher();
  const uuid = uuidv4();

  let nameElement: HTMLInputElement | null = null;
  let loading = false;
  let address = '';
  let name = '';
  let error = '';

  $: buttonDisabled = loading || error || !address || !name;

  onMount(() => {
    if (nameElement && nameElement.focus) {
      nameElement.focus();
    }
  });

  const handleSubmit = async (e: Event) => {
		e.preventDefault();

		try {
			loading = true;
			await addContact({
        name,
        address
      });
      await getContacts();
      dispatch('close');
		} catch (err) {
      console.log(err);
      error = (err as Error).message;
		}
		loading = false;
	}
</script>

<form on:submit={handleSubmit}>
  <div id={uuid}/>
  <label class:error={Boolean(error)}>
    {error}
    <input
      bind:this={nameElement}
      bind:value={address}
      class:error={Boolean(error)}
      placeholder={$_('send.recipient.placeholder')}
      class:loading={loading}
      disabled={loading}
    />
  </label>
  <label>
    <input
      bind:value={name}
      class:loading={loading}
      disabled={loading}
      placeholder={$_('contacts.form.name_placeholder')}
    />
  </label>
  <button
    class="outline"
    disabled={Boolean(buttonDisabled)}
  >
    {$_('contacts.form.add')}
  </button>
</form>

<style lang="scss">
	@import "../styles/mixins";
  form {
    padding: 30px;
    height: 600px;
    @include flex-center-top-column;

    & > label,
    & > button {
      margin: 10px;
      min-width: 290px;
      max-width: 400px;
      width: 100%;
    }
  }
</style>
